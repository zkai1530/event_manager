package com.datn.event_manager.service.Follow;

import org.springframework.stereotype.Service;

import com.datn.event_manager.entity.Follow;
import com.datn.event_manager.entity.User;
import com.datn.event_manager.exception.AppException;
import com.datn.event_manager.exception.ErrorCode;
import com.datn.event_manager.repository.FollowRepository;
import com.datn.event_manager.repository.UserRepository;
import com.datn.event_manager.service.Authentication.AuthenticationService;
import jakarta.transaction.Transactional;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FollowServiceImpl implements FollowService {
    AuthenticationService authenticationService;
    FollowRepository followRepository;
    UserRepository userRepository;

    @Override
    public void followUser(String followingId) {
        User follower = authenticationService.getUserFromToken();
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (followRepository.existsByFollowerAndFollowing(follower, following)) {
            throw new AppException(ErrorCode.ALREADY_FOLLOW);
        }

        Follow follow = Follow.builder()
                .follower(follower)
                .following(following)
                .build();

        followRepository.save(follow);
    }

    @Override
    @Transactional
    public void unFollowUser(String followingId) {
        User follower = authenticationService.getUserFromToken();
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (!followRepository.existsByFollowerAndFollowing(follower, following)) {
            throw new AppException(ErrorCode.NOT_FOLLOWING);
        }

        followRepository.deleteByFollowerAndFollowing(follower, following);
    }

    @Override
    public boolean isFollowing(String followingId) {
        User follower = authenticationService.getUserFromToken();
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return followRepository.existsByFollowerAndFollowing(follower, following);
    }

}
