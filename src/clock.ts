import { useEffect, useState } from 'react'
/** Thời điểm hiện tại, tự cập nhật sau mỗi khoảng `ms` (để trang để mở qua đêm vẫn đúng ngày, thanh thời gian chạy đều). */
export function useNow(ms: number): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(id)
  }, [ms])
  return now
}
