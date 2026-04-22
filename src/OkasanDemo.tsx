import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile} from 'remotion';

// シンプルな2.5Dアニメ：呼吸＋軽い揺れ
export const OkasanDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  // 呼吸: ±2% scale, 3秒周期
  const breath = 1 + 0.02 * Math.sin((frame / fps) * 2 * Math.PI / 3);

  // 体の揺れ: ±1.5deg, 4秒周期
  const sway = 1.5 * Math.sin((frame / fps) * 2 * Math.PI / 4);

  // 登場スプリング
  const entrance = spring({frame, fps, config: {damping: 12, stiffness: 80}});
  const scale = interpolate(entrance, [0, 1], [0.85, 1]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  // まばたき（8秒に1回、0.15秒続く）
  const blinkT = (frame / fps) % 8;
  const blinkScaleY = blinkT > 7.8 && blinkT < 7.95 ? 0.1 : 1;

  return (
    <AbsoluteFill style={{backgroundColor: '#fffaeb', alignItems: 'center', justifyContent: 'center'}}>
      <div
        style={{
          transform: `scale(${scale * breath}) rotate(${sway}deg)`,
          opacity,
          transformOrigin: 'bottom center',
        }}
      >
        <Img
          src={staticFile('okasan/okasan_bg.png')}
          style={{
            height: height * 0.85,
            filter: `brightness(${0.98 + 0.02 * Math.sin(frame/fps * 2 * Math.PI)})`,
          }}
        />
      </div>
      {/* まばたき overlay (簡易): 目の位置に薄いマスク */}
      <div style={{
        position: 'absolute',
        top: height * 0.28,
        left: width * 0.5 - 80,
        width: 160,
        height: 12,
        backgroundColor: '#f5dcc5',
        transform: `scaleY(${1 - blinkScaleY})`,
        transformOrigin: 'center',
        borderRadius: 6,
      }} />
    </AbsoluteFill>
  );
};
