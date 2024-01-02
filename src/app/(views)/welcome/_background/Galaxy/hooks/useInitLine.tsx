import {

  TextureLoader,
  TubeGeometry,

  Object3D,
  Mesh,
  // PlaneBufferGeometry,
  MeshBasicMaterial,
  FrontSide,
  // DoubleSide,
  RepeatWrapping,
  CubicBezierCurve3,
  Vector3,
  CatmullRomCurve3,

  SRGBColorSpace
  //   MathUtils
} from 'three'

import * as Curves from 'three/examples/jsm/curves/CurveExtras.js';

export const initLine = () => {
  const sampleClosedSpline = new CatmullRomCurve3([
    new Vector3(0, 0, -140),
    new Vector3(140, 0, 0),
    new Vector3(0, 0, 140),
    new Vector3(-140, 0, 0),

  ], true, 'catmullrom')

  const splines = {
    GrannyKnot: new Curves.GrannyKnot(),
    VivianiCurve: new Curves.VivianiCurve(100),
    KnotCurve: new Curves.KnotCurve(),

    TrefoilKnot: new Curves.TrefoilKnot(),
    TorusKnot: new Curves.TorusKnot(20),
    CinquefoilKnot: new Curves.CinquefoilKnot(20),
    arc: new CubicBezierCurve3(
      new Vector3(0, 0, 0),
      new Vector3(0, 0, 200),
      new Vector3(0, 0, 0),
      new Vector3(0, 0, 200)
    ),
    sampleClosedSpline
  };

  const params = {
    splines: splines.sampleClosedSpline,
    tubularSegments: 32,
    radius: 4,
    radiusSegments: 32
  };

  const tubeGeometry = new TubeGeometry(
    params.splines,
    params.tubularSegments,
    params.radius,
    params.radiusSegments,
    true // closed
  );

  const texture = new TextureLoader().load('/images/space.jpg')

  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.colorSpace = SRGBColorSpace
  const tubeMaterial = new MeshBasicMaterial({
    wireframe: false,
    transparent: true,
    opacity: 0.31,
    side: FrontSide,
    map: texture,

    // alphaTest: 0.2

  });

  const parent = new Object3D();

  const tube = new Mesh(tubeGeometry, tubeMaterial);

  tubeGeometry.scale(1, 1, -1)

  parent.add(tube);

  return {
    parent, tube
  }
}
