package com.datn.event_manager.service.VenueMap;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.datn.event_manager.dto.request.SeatMapRequest.SeatRequest;
import com.datn.event_manager.dto.request.SeatMapRequest.SectionRequest;
import com.datn.event_manager.dto.request.SeatMapRequest.VenueMapRequest;
import com.datn.event_manager.dto.response.seatmap.VenueMapResponse;
import com.datn.event_manager.entity.Event;
import com.datn.event_manager.entity.Seat;
import com.datn.event_manager.entity.Seat.SeatStatus;
import com.datn.event_manager.entity.Section;
import com.datn.event_manager.entity.User;
import com.datn.event_manager.entity.VenueMap;
import com.datn.event_manager.exception.AppException;
import com.datn.event_manager.exception.ErrorCode;
import com.datn.event_manager.mapper.VenueMapMapper;
import com.datn.event_manager.repository.EventRepository;
import com.datn.event_manager.repository.VenueMapRepository;
import com.datn.event_manager.service.Authentication.AuthenticationService;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class VenueMapServiceImpl implements VenueMapService {
    VenueMapRepository venueMapRepository;
    EventRepository eventRepository;
    AuthenticationService authenticationService;
    VenueMapMapper venueMapMapper;

    @Override
    @Transactional
    public void createVenueMap(VenueMapRequest request) {
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid event ID"));

        User user = authenticationService.getUserFromToken();
        if (!event.getUser().getUserId().equals(user.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Kiểm tra đã có VenueMap chưa
        if (venueMapRepository.existsByEventEventId(request.getEventId())) {
            throw new IllegalArgumentException("VenueMap already exists for this event");
        }

        if (event.getSchedules().size() != 1) {
            throw new IllegalArgumentException("Event with seat map must have exactly one schedule");
        }

        if (event.getIsPublished()) {
            throw new AppException(ErrorCode.EVENT_ALREADY_PUBLISHED);
        }

        // Tạo VenueMap từ request
        VenueMap venueMap = venueMapMapper.toEntity(request);
        venueMap.setEvent(event);
        venueMap.setCreatedAt(LocalDateTime.now());

        // Tạo Sections và Seats
        List<Section> sections = new ArrayList<>();
        for (var sectionReq : request.getSections()) {
            // Kiểm tra số lượng seats
            int expectedSeats = sectionReq.getTotalRows() * sectionReq.getSeatsPerRow();
            if (sectionReq.getSeats() == null || sectionReq.getSeats().size() != expectedSeats) {
                throw new IllegalArgumentException("Number of seats in section " + sectionReq.getName() +
                        " must be " + expectedSeats);
            }

            Section section = Section.builder()
                    .venueMap(venueMap)
                    .name(sectionReq.getName())
                    .totalRows(sectionReq.getTotalRows())
                    .seatsPerRow(sectionReq.getSeatsPerRow())
                    .positionX(sectionReq.getPositionX())
                    .positionY(sectionReq.getPositionY())
                    .rotation(sectionReq.getRotation())
                    .theaterCurve(sectionReq.getTheaterCurve())
                    .createdAt(LocalDateTime.now())
                    .build();

            // Tạo Seats từ request
            List<Seat> seats = sectionReq.getSeats().stream()
                    .map(seatReq -> Seat.builder()
                            .section(section)
                            .rowLabel(seatReq.getRowLabel())
                            .seatLabel(seatReq.getSeatLabel())
                            .status(SeatStatus.AVAILABLE)
                            .createdAt(LocalDateTime.now())
                            .build())
                    .toList();
            section.setSeats(seats);
            sections.add(section);
        }
        venueMap.setSections(sections);

        // Lưu VenueMap
        venueMapRepository.save(venueMap);

        // Tạo response
        // return venueMapMapper.toResponse(venueMap);
    }

    @Override
    @Transactional
    public VenueMapResponse updateVenueMap(Long venueMapId, VenueMapRequest request) {
        VenueMap venueMap = venueMapRepository.findById(venueMapId)
                .orElseThrow(() -> new AppException(ErrorCode.VENUEMAP_NOT_FOUND));

        User user = authenticationService.getUserFromToken();
        if (!venueMap.getEvent().getUser().getUserId().equals(user.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (venueMap.getEvent().getIsPublished()) {
            throw new AppException(ErrorCode.EVENT_ALREADY_PUBLISHED);
        }

        // Kiểm tra eventId trong request
        if (!venueMap.getEvent().getEventId().equals(request.getEventId())) {
            throw new IllegalArgumentException("Event ID does not match VenueMap");
        }

        // Cập nhật stage
        venueMap.setStagePositionX(request.getStagePositionX());
        venueMap.setStagePositionY(request.getStagePositionY());
        venueMap.setStageWidth(request.getStageWidth());
        venueMap.setStageHeight(request.getStageHeight());

        // Lấy sections hiện tại
        List<Section> currentSections = new ArrayList<>(venueMap.getSections());

        // Xác định sections cần giữ
        Set<Long> requestSectionIds = request.getSections().stream()
                .filter(req -> req.getSectionId() != null)
                .map(SectionRequest::getSectionId)
                .collect(Collectors.toSet());

        // Xóa sections không có trong request khỏi collection gốc
        venueMap.getSections().removeIf(section -> !requestSectionIds.contains(section.getSectionId()));

        // Cập nhật hoặc thêm sections
        for (var sectionReq : request.getSections()) {
            // Kiểm tra số ghế hợp lệ
            int expectedSeatsMax = sectionReq.getTotalRows() * sectionReq.getSeatsPerRow();
            if (sectionReq.getSeats() == null || sectionReq.getSeats().isEmpty()) {
                throw new IllegalArgumentException("Section " + sectionReq.getName() + " must have at least one seat");
            }
            if (sectionReq.getSeats().size() > expectedSeatsMax) {
                throw new IllegalArgumentException("Number of seats in section " + sectionReq.getName() +
                        " exceeds " + expectedSeatsMax);
            }

            Section section;
            if (sectionReq.getSectionId() != null) {
                // Cập nhật section tồn tại
                section = currentSections.stream()
                        .filter(s -> s.getSectionId().equals(sectionReq.getSectionId()))
                        .findFirst()
                        .orElseThrow(() -> new IllegalArgumentException(
                                "Section ID " + sectionReq.getSectionId() + " not found"));
                section.setName(sectionReq.getName());
                section.setTotalRows(sectionReq.getTotalRows());
                section.setSeatsPerRow(sectionReq.getSeatsPerRow());
                section.setPositionX(sectionReq.getPositionX());
                section.setPositionY(sectionReq.getPositionY());
                section.setRotation(sectionReq.getRotation());
                section.setTheaterCurve(sectionReq.getTheaterCurve());

                // Khởi tạo seats nếu null
                if (section.getSeats() == null) {
                    section.setSeats(new ArrayList<>());
                }

                // Lấy danh sách seats hiện tại
                List<Seat> currentSeats = new ArrayList<>(section.getSeats());

                // Cập nhật hoặc thêm seats dựa trên thứ tự
                List<SeatRequest> newSeats = sectionReq.getSeats();
                for (int i = 0; i < newSeats.size(); i++) {
                    SeatRequest seatReq = newSeats.get(i);
                    if (i < currentSeats.size()) {
                        // Cập nhật seat hiện có
                        Seat seat = currentSeats.get(i);
                        seat.setRowLabel(seatReq.getRowLabel());
                        seat.setSeatLabel(seatReq.getSeatLabel());
                        // Giữ nguyên status, createdAt, seatId
                    } else {
                        // Thêm seat mới
                        Seat newSeat = Seat.builder()
                                .section(section)
                                .rowLabel(seatReq.getRowLabel())
                                .seatLabel(seatReq.getSeatLabel())
                                .status(SeatStatus.AVAILABLE)
                                .createdAt(LocalDateTime.now())
                                .build();
                        section.getSeats().add(newSeat);
                    }
                }

                // Xóa seats thừa nếu danh sách mới ngắn hơn
                if (newSeats.size() < currentSeats.size()) {
                    section.getSeats().subList(newSeats.size(), currentSeats.size()).clear();
                }
            } else {
                // Tạo section mới
                section = venueMapMapper.toSectionEntity(sectionReq);
                section.setVenueMap(venueMap);
                section.setCreatedAt(LocalDateTime.now());
                section.setSeats(new ArrayList<>());

                // Tạo seats mới
                List<Seat> seats = sectionReq.getSeats().stream()
                        .map(seatReq -> Seat.builder()
                                .section(section)
                                .rowLabel(seatReq.getRowLabel())
                                .seatLabel(seatReq.getSeatLabel())
                                .status(SeatStatus.AVAILABLE)
                                .createdAt(LocalDateTime.now())
                                .build())
                        .toList();
                section.getSeats().addAll(seats);

                // Thêm section mới vào collection gốc
                venueMap.getSections().add(section);
            }
        }

        venueMapRepository.save(venueMap);

        // Đảm bảo has_seat_map
        Event event = venueMap.getEvent();
        event.setHasSeatMap(!venueMap.getSections().isEmpty());
        eventRepository.save(event);

        return venueMapMapper.toResponse(venueMap);
    }

    @Override
    @Transactional
    public void deleteVenueMap(Long venueMapId) {
        VenueMap venueMap = venueMapRepository.findById(venueMapId)
                .orElseThrow(() -> new IllegalArgumentException("VenueMap not found"));

        User user = authenticationService.getUserFromToken();
        if (!venueMap.getEvent().getUser().getUserId().equals(user.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (venueMap.getEvent().getIsPublished()) {
            throw new AppException(ErrorCode.EVENT_ALREADY_PUBLISHED);
        }

        // Cập nhật has_seat_map
        Event event = venueMap.getEvent();
        event.setHasSeatMap(false);
        eventRepository.save(event);

        // Xóa VenueMap (cascade xóa sections và seats)
        venueMapRepository.delete(venueMap);
    }

    @Override
    public VenueMapResponse getVenueMap(Long venueMapId) {
        User user = authenticationService.getUserFromToken();

        VenueMap venueMap = venueMapRepository.findById(venueMapId)
                .orElseThrow(() -> new AppException(ErrorCode.VENUEMAP_NOT_FOUND));

        if (!user.getUserId().equals(venueMap.getEvent().getUser().getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        };
     
        return venueMapMapper.toResponse(venueMap);
    }
}
