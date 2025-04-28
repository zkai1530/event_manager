package com.datn.event_manager.service.Cloudinary;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.apache.commons.lang3.StringUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryServiceImpl implements CloudinaryService {
    private final Cloudinary cloudinary;

    @Override
    public String uploadImage(MultipartFile file) throws IOException {
        if (file == null || file.getOriginalFilename() == null) {
            return null; 
        }
        String publicValue = generatePublicValue(file.getOriginalFilename());
        log.info("publicValue is: {}", publicValue);
        String extension = getFileName(file.getOriginalFilename())[1];
        log.info("extension is: {}", extension);
        File fileUpload = convert(file);
        log.info("fileUpload is: {}", fileUpload);
        cloudinary.uploader().upload(fileUpload, ObjectUtils.asMap("public_id", publicValue));
        cleanDisk(fileUpload);
        return cloudinary.url().generate(publicValue + "." + extension);
    }

    private File convert(MultipartFile file) throws IOException {
        if (file == null || file.getOriginalFilename() == null) {
            throw new IllegalArgumentException("File or filename cannot be null");
        }
        File convFile = new File(
                generatePublicValue(file.getOriginalFilename()) + getFileName(file.getOriginalFilename())[1]);
        try (InputStream is = file.getInputStream()) {
            Files.copy(is, convFile.toPath());
        }
        return convFile;
    }

    private void cleanDisk(File file) {
        try {
            log.info("file.toPath(): {}", file.toPath());
            Path filePath = file.toPath();
            Files.delete(filePath);
        } catch (IOException e) {
            log.error("Error deleting file: {}", file.getPath(), e);
        }
    }

    @Override
    public void deleteImage(String publicId) throws IOException {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            log.info("Deleted image with publicId: {}", publicId);
        } catch (Exception e) {
            log.error("Error deleting image with publicId: {}", publicId, e);
            throw new IOException("Failed to delete image", e);
        }
    }

    @Override
    public String extractPublicId(String imageUrl) {
        if (imageUrl == null)
            return null;
        // Giả sử URL có dạng:
        // https://res.cloudinary.com/your_cloud_name/image/upload/.../public_id.extension
        String[] parts = imageUrl.split("/");
        String fileName = parts[parts.length - 1]; // Lấy phần cuối (public_id.extension)
        log.info("file", fileName.substring(0, fileName.lastIndexOf(".")));
        return fileName.substring(0, fileName.lastIndexOf(".")); // Bỏ extension
    }

    @Override
    public String updateImage(MultipartFile file, String oldPublicId) throws IOException {
        if (StringUtils.isNotBlank(oldPublicId)) {
            deleteImage(oldPublicId);
        }
        return uploadImage(file);
    }

    public String generatePublicValue(String originalName) {
        String fileName = getFileName(originalName)[0];
        return UUID.randomUUID().toString() + "_" + fileName;
    }

    public String[] getFileName(String originalName) {
        if (originalName == null || !originalName.contains(".")) {
            throw new IllegalArgumentException("Invalid file name: " + originalName);
        }
        String[] parts = originalName.split("\\.");
        if (parts.length < 2) {
            throw new IllegalArgumentException("File name has no extension: " + originalName);
        }
        return parts;
    }

}