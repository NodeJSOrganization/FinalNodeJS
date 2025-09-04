// src/hooks/useWindowSize.js
import { useState, useEffect } from 'react';

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    // Hàm xử lý khi kích thước cửa sổ thay đổi
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Thêm một event listener để theo dõi sự kiện "resize"
    window.addEventListener('resize', handleResize);

    // Gọi handleResize ngay lập-tức để lấy kích thước ban đầu
    handleResize();

    // Dọn dẹp: Gỡ bỏ event listener khi component bị unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Mảng rỗng đảm bảo effect này chỉ chạy một lần lúc mount

  return windowSize;
}