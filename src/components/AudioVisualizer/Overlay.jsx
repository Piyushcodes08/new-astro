import React from 'react'
import { Footer } from '@pmndrs/branding'
import useStore from './store'
import './AudioVisualizer.css'

export default function Overlay() {
  const loaded = useStore((state) => state.loaded)
  const clicked = useStore((state) => state.clicked)
  const api = useStore((state) => state.api)

  return (
    <>
      <div className={`fullscreen bg ${loaded ? 'loaded' : 'notready'} ${clicked ? 'clicked' : ''}`}>
        <div onClick={() => loaded && api.start()}>
          {!loaded ? (
            'loading'
          ) : (
            <>
              <span style={{ color: '#606060' }}>3D Visualizer Experience</span>
              <br />
              <b>
                <span style={{ color: 'black' }}>click to enter</span>
              </b>
            </>
          )}
        </div>
      </div>
      <Footer
        date={<span>@0xca0a</span>}
        year={<span>pmndrs sound test demo</span>}
        link1={<a href="https://github.com/pmndrs/react-three-fiber">pmndrs/react-three-fiber</a>}
        link2={<a href="https://codesandbox.io/s/sound-test-dvokj">original code</a>}
      />
    </>
  )
}
