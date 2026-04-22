#!/usr/bin/env python3
"""
episode.yaml → Remotion --props JSON 変換スクリプト

Usage:
  # JSON を stdout に出力（Remotion に直接渡す）
  npx remotion render src/index.ts IrasutoyaShort out/ep001.mp4 \
    --props="$(python3 scripts/episode-to-props.py episode.yaml)"

  # ファイルに保存
  python3 scripts/episode-to-props.py episode.yaml > /tmp/props.json
  npx remotion render src/index.ts IrasutoyaShort out/ep001.mp4 --props=/tmp/props.json

episode.yaml フォーマット:
  channel_label: 偉人の転換点
  transition: slide          # slide | fade | wipe
  transition_frames: 12
  bgm:
    src: ambient_test.mp3
    volume: 0.06
  segments:
    - id: 1
      narration: ジョブズが追い出された日...
      question: ジョブズが追い出された日
      answer: 株価は上がった
      answer_color: "#e8254a"
      answer_reveal_at: 0.55
      image: great-figures/jobs.jpg
      voice: ep001/01_hook.wav
      duration: 97
      pause: 6
"""

import json
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    print("pip install pyyaml", file=sys.stderr)
    sys.exit(1)


def load_episode(yaml_path: str) -> dict:
    with open(yaml_path) as f:
        data = yaml.safe_load(f)

    # script.yaml 形式との互換 (segments に displayText/narration がある場合)
    segments = []
    for seg in data.get("segments", []):
        s = {
            "id": seg.get("id"),
            "narration": seg.get("narration", ""),
            "question": seg.get("question") or seg.get("questionText") or seg.get("displayText", "")[:25],
            "image": seg.get("image") or seg.get("imageFile", ""),
            "voice": seg.get("voice") or seg.get("voiceFile", ""),
            "duration": seg.get("duration") or seg.get("durationInFrames", 90),
            "pause": seg.get("pause") or seg.get("pauseAfter", 6),
        }
        if "answer" in seg or "answerText" in seg:
            s["answer"] = seg.get("answer") or seg.get("answerText")
        if "answer_color" in seg or "answerColor" in seg:
            s["answer_color"] = seg.get("answer_color") or seg.get("answerColor")
        if "answer_reveal_at" in seg or "answerRevealAt" in seg:
            s["answer_reveal_at"] = seg.get("answer_reveal_at") or seg.get("answerRevealAt")
        if "bg_color" in seg or "bgColor" in seg:
            s["bg_color"] = seg.get("bg_color") or seg.get("bgColor")
        if "sound_effect" in seg or "soundEffect" in seg:
            s["sound_effect"] = seg.get("sound_effect") or seg.get("soundEffect")
        segments.append(s)

    props = {"segments": segments}
    for key in ["channel_label", "transition", "transition_frames", "bgm"]:
        snake = key
        camel = "".join(w.capitalize() if i else w for i, w in enumerate(key.split("_")))
        val = data.get(snake) or data.get(camel)
        if val is not None:
            props[key] = val

    return props


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <episode.yaml>", file=sys.stderr)
        sys.exit(1)
    props = load_episode(sys.argv[1])
    print(json.dumps(props, ensure_ascii=False))
