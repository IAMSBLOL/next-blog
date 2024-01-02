import { useEffect, useState } from 'react'

export const useGetWindowInfo = () => {
  const [win, setWin] = useState({
    width: 0,
    height: 0
  })
  useEffect(() => {
    if (window) {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setWin({
        width, height
      })
    }
  }, [])

  return win
}
