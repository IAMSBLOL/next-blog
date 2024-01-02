/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare module '*.glsl' {
  const styles: any;
  export = styles;
}

declare module '*.svg' {

  const _: FC<SVGProps<HTMLOrSVGElement> & { title?: string }>;
  export = _;
}
