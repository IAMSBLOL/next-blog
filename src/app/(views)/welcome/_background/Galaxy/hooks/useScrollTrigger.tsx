import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger);

export const useScrollTrigger = (scrollTotal:number) => {
  const yes = useRef(false)
  useLayoutEffect(() => {
    if (scrollTotal === 0) {
      return
    }
    ScrollTrigger.create({
      start: 0,
      end: `+=${scrollTotal}`,
      horizontal: false,
      pin: '.scroll',

      // onUpdate: (self) => {
      //   const SCROLL = self.scroll();
      //   if (SCROLL > self.end - 1) {
      //     // Go forwards in time

      //     wrap(1, 1);
      //   } else if (SCROLL < 1 && self.direction < 0) {
      //     // Go backwards in time
      //     wrap(-1, self.end - 1);
      //   }
      // },
      snap: 1 / 2,
      onSnapComplete: (self) => {
        const scrollTop = self.scroll()
        if (scrollTop === window.innerHeight) {
          if (!yes.current) {
            console.log('yesyes')
            // dispatch(setTextShow({ show: true }))
            yes.current = true
          }
        }
      }
    });
  }, [scrollTotal])
}
