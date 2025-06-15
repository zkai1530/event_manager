package com.datn.event_manager.mapper;

import java.util.List;

import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import com.datn.event_manager.dto.request.AuthenticationRequest;
import com.datn.event_manager.dto.response.UserProfileResponse;
import com.datn.event_manager.dto.response.UserResponse;
import com.datn.event_manager.entity.User;
import com.datn.event_manager.utils.AESEncryptionUtil;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toUser(AuthenticationRequest request);

    UserResponse toUserResponse(AuthenticationRequest request);

    @Mapping(target = "roleName", source = "role.roleName")
    UserResponse toUserResponse(User user);

    List<UserResponse> toUserResponseList(List<User> users);

    @Mapping(target = "accountNumber", source = "bankAccount.accountNumber", qualifiedByName = "decryptAccountNumber")
    @Mapping(target = "accountName", source = "bankAccount.accountName")
    @Mapping(target = "bankName", source = "bankAccount.bankName")
    @Mapping(target = "bankShortName", source = "bankAccount.bankShortName")
    UserProfileResponse tUserProfileResponse(User user, @Context String secretKey);

    @Named("decryptAccountNumber")
    default String decryptAccountNumber(String encryptedAccountNumber, @Context String secretKey) throws Exception {
        if (encryptedAccountNumber != null) {
            return AESEncryptionUtil.decrypt(encryptedAccountNumber, secretKey);
        }
        return null;
    }
}
