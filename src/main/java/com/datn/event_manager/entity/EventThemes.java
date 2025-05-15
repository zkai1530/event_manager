package com.datn.event_manager.entity;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
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
@Table(name = "event_themes")
public class EventThemes {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long themeId;

    String themeName;

    @OneToMany(mappedBy = "theme", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    List<Event> events;
}
