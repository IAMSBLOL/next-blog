import './info.scss'

/**
 * 没钱买正版插件难受啊
 * @returns
 */
const Info = () => {
  return (
    <div className='info_wrap'>
      <div className='component book_wrap'>
        <ul className='align'>
          <li>
            <figure className='book xs:w-48 xs:h-64 md:w-80 md:h-[440px]'>

              <ul className='hardcover_front'>
                <li>
                  <div className='coverDesign flex justify-center items-center'>
                    <p>MARTIX</p>
                  </div>
                </li>
                <li />
              </ul>

              <ul className='page'>
                <li className='page_li_1' />
                <li className='page_li_2' />
                <li className='page_li_3' />
                <li className='page_li_4' />
                <li className='page_li_5' />
              </ul>

              <ul className='hardcover_back'>
                <li />
                <li />
              </ul>
              <ul className='book_spine'>
                <li />
                <li />
              </ul>

            </figure>
          </li>
        </ul>
      </div>

    </div>
  )
}

export default Info
