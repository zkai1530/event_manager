package com.datn.event_manager.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "venue_map")
public class VenueMap {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "venue_map_id")
    Long venueMapId;

    @Column(name = "stage_position_x")
    Double stagePositionX;

    @Column(name = "stage_position_y")
    Double stagePositionY;

    @Column(name = "stage_width")
    Double stageWidth;

    @Column(name = "stage_height")
    Double stageHeight;

    @Column(name = "created_at")
    LocalDateTime createdAt;

    @OneToOne
    @JoinColumn(name = "event_id")
    Event event;

    @OneToMany(mappedBy = "venueMap", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<Section> sections = new ArrayList<>();
}
