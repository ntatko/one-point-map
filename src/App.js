import React, { useState, useEffect } from 'react'
import {
  Map,
  BasemapContainer,
  ContextMenu,
  Controls,
  Popup,
  VectorLayer
} from '@bayer/ol-kit'
import { fromLonLat } from 'ol/proj'
import olFeature from 'ol/Feature'
import olGeomPoint from 'ol/geom/Point'
import olSourceVector from 'ol/source/Vector'
import olStyle from 'ol/style/Style'
import olStroke from 'ol/style/Stroke'
import olIcon from 'ol/style/Icon'

const App = () => {
  const [showBasemapContainer, setShowBasemapContainer] = useState(true)
  const [showContextMenu, setShowContextMenu] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const [showPopup, setShowPopup] = useState(true)

  useEffect(() => {
    const queryParams = window.location.search.split(/([?&])/g).filter(e => e.length > 1).reduce((acc, str) => {
      const stringSplit = str.split('=')
      acc[stringSplit[0]] = stringSplit[1]
      return acc
    }, {})

    if (queryParams.show_basemap && queryParams.show_basemap === 'false') {
      setShowBasemapContainer(false)
    }
    if (queryParams.show_popup && queryParams.show_popup === 'false') {
      setShowPopup(false)
    }
    if (queryParams.show_context && queryParams.show_context === 'false') {
      setShowContextMenu(false)
    }
    if (queryParams.show_controls && queryParams.show_controls === 'false') {
      setShowControls(false)
    }
  }, [])

  const onMapInit = map => {
    const queryParams = window.location.search.split(/([?&])/g).filter(e => e.length > 1).reduce((acc, str) => {
      const stringSplit = str.split('=')
      acc[stringSplit[0]] = stringSplit[1]
      return acc
    }, {})

    if ((queryParams.long || queryParams.lon) && queryParams.lat) {
      const point = new olFeature({
        geometry: new olGeomPoint(fromLonLat([queryParams.long || queryParams.lon, queryParams.lat])),
        ...(queryParams.title ? { title: queryParams.title || undefined } : {})
      })

      if (queryParams.icon_url) {
        point.setStyle(new olStyle({
          stroke: new olStroke(),
          image: new olIcon({
            opacity: 1,
            src: queryParams.icon_url,
            scale: (queryParams.icon_scale && !isNaN(queryParams.icon_scale)) ? Number(queryParams.icon_scale) : 1
          })
        }))
      }

      const layer = new VectorLayer({
        source: new olSourceVector({
          features: [point]
        })
      })
      map.addLayer(layer)
      map.getView().fit(point.getGeometry().getExtent())

      if (queryParams.zoom && !isNaN(queryParams.zoom)) {
        map.getView().setZoom(Number(queryParams.zoom))
      } else {
        map.getView().setResolution(14)
      }

    } else {
      throw new Error("Missing coordinates")
    }
  }

  return (
    <Map onMapInit={onMapInit} fullScreen>
      {showBasemapContainer && <BasemapContainer />}
      {showContextMenu && <ContextMenu />}
      {showControls && <Controls />}
      {showPopup && <Popup />}
    </Map>
  )
}

export default App