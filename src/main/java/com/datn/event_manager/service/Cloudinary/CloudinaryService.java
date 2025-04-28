package com.datn.event_manager.service.Cloudinary;

import java.io.IOException;

import org.springframework.web.multipart.MultipartFile;

public interface CloudinaryService {
    String uploadImage(MultipartFile file) throws IOException;
    
    void deleteImage(String publicId) throws IOException;

    String updateImage(MultipartFile file, String oldPublicId) throws IOException;

    String extractPublicId(String imageUrl);
}
