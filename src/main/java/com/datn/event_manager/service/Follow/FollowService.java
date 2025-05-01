package com.datn.event_manager.service.Follow;

public interface FollowService {
    void followUser(String followingId);

    void unFollowUser(String followingId);

    boolean isFollowing(String followingId);
}
