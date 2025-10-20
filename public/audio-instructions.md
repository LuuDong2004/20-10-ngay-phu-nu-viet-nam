# Hướng dẫn thêm nhạc "Có chắc yêu là đây"

## Cách thêm nhạc:

1. **Tải nhạc "Có chắc yêu là đây" của Sơn Tùng M-TP** (định dạng MP3 hoặc WAV)

2. **Đặt file nhạc vào thư mục public:**
   ```
   public/
   ├── audio/
   │   └── co-chac-yeu-la-day.mp3
   ```

3. **Cập nhật đường dẫn trong VNWomen2010Celebration.jsx:**
   Thay thế dòng:
   ```javascript
   <source src="https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" type="audio/wav" />
   ```
   
   Thành:
   ```javascript
   <source src="/audio/co-chac-yeu-la-day.mp3" type="audio/mpeg" />
   ```

## Lưu ý về bản quyền:
- Đảm bảo bạn có quyền sử dụng file nhạc
- Chỉ sử dụng cho mục đích cá nhân
- Không phân phối công khai file nhạc có bản quyền

## Các nguồn nhạc miễn phí thay thế:
- Freesound.org
- Zapsplat.com
- YouTube Audio Library
- Pixabay Music
