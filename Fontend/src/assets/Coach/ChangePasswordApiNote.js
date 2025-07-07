// Note for Backend Developer:
// Cần thêm endpoint cho chức năng đổi mật khẩu của Coach

/*
1. Thêm ChangePasswordRequest DTO:

package org.datcheems.swp_projectnosmoking.dto.request;

import lombok.Data;

@Data
public class ChangePasswordRequest {
    private String currentPassword;
    private String newPassword;
}

2. Thêm endpoint vào CoachController.java:

@PutMapping("/change-password")
public ResponseEntity<ResponseObject<String>> changePassword(
    @AuthenticationPrincipal Jwt principal, 
    @RequestBody ChangePasswordRequest request) {
    String username = principal.getSubject();
    return coachService.changePassword(username, request);
}

3. Thêm method trong CoachService.java:

public ResponseEntity<ResponseObject<String>> changePassword(String username, ChangePasswordRequest request) {
    try {
        // Tìm user theo username
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Kiểm tra mật khẩu hiện tại
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            ResponseObject<String> response = new ResponseObject<>();
            response.setStatus("error");
            response.setMessage("Mật khẩu hiện tại không đúng");
            return ResponseEntity.badRequest().body(response);
        }
        
        // Cập nhật mật khẩu mới
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        ResponseObject<String> response = new ResponseObject<>();
        response.setStatus("success");
        response.setMessage("Đổi mật khẩu thành công");
        response.setData(null);
        
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        ResponseObject<String> response = new ResponseObject<>();
        response.setStatus("error");
        response.setMessage("Lỗi khi đổi mật khẩu: " + e.getMessage());
        return ResponseEntity.badRequest().body(response);
    }
}

4. Sau khi thêm API, uncomment phần code trong CoachProfile.jsx:

- Trong method handleChangePassword(), uncomment đoạn code API call
- Remove dòng alert tạm thời
*/

export default null;
