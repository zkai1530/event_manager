package com.datn.event_manager.dto.response;
import com.datn.event_manager.dto.response.ticketsales.OrderTicketResponse1;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

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
public class SuccessOrderResponse {
    Long orderId;           
    String eventName;       
    String imageUrl;  
    LocalDate scheduleDate; 
    LocalTime startTime;    
    LocalTime endTime;    
    String city;  
    String address;       
    String country;        
    String customerName;    
    String email;          
    String phoneNumber;     
    List<OrderTicketResponse1> tickets; 
}
