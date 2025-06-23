package com.datn.event_manager.service.VenueMap;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

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
        // Kiểm tra VenueMap tồn tại
        VenueMap venueMap = venueMapRepository.findById(venueMapId)
                .orElseThrow(() -> new IllegalArgumentException("VenueMap not found"));

        // Kiểm tra quyền sở hữu
        User user = authenticationService.getUserFromToken();
        if (!venueMap.getEvent().getUser().getUserId().equals(user.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Kiểm tra event chưa published
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
            int expectedSeats = sectionReq.getTotalRows() * sectionReq.getSeatsPerRow();
            if (sectionReq.getSeats() == null || sectionReq.getSeats().size() != expectedSeats) {
                throw new IllegalArgumentException("Number of seats in section " + sectionReq.getName() +
                        " must be " + expectedSeats);
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

                // So sánh seats cũ và mới
                Set<String> newSeatKeys = sectionReq.getSeats().stream()
                        .map(seatReq -> seatReq.getRowLabel() + ":" + seatReq.getSeatLabel())
                        .collect(Collectors.toSet());

                // Xóa seats không còn trong request
                section.getSeats()
                        .removeIf(seat -> !newSeatKeys.contains(seat.getRowLabel() + ":" + seat.getSeatLabel()));

                // Thêm seats mới
                List<Seat> currentSeats = section.getSeats();
                List<Seat> seatsToAdd = sectionReq.getSeats().stream()
                        .filter(seatReq -> currentSeats.stream()
                                .noneMatch(seat -> seat.getRowLabel().equals(seatReq.getRowLabel()) &&
                                        seat.getSeatLabel().equals(seatReq.getSeatLabel())))
                        .map(seatReq -> Seat.builder()
                                .section(section)
                                .rowLabel(seatReq.getRowLabel())
                                .seatLabel(seatReq.getSeatLabel())
                                .status(SeatStatus.AVAILABLE)
                                .createdAt(LocalDateTime.now())
                                .build())
                        .toList();
                section.getSeats().addAll(seatsToAdd);
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

        // Lưu VenueMap
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
        // Kiểm tra VenueMap tồn tại
        VenueMap venueMap = venueMapRepository.findById(venueMapId)
                .orElseThrow(() -> new IllegalArgumentException("VenueMap not found"));

        // Kiểm tra quyền sở hữu
        User user = authenticationService.getUserFromToken();
        if (!venueMap.getEvent().getUser().getUserId().equals(user.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Kiểm tra event chưa published
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
}
