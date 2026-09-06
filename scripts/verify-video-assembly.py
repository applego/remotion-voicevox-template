#!/usr/bin/env python3
"""Render self-owned motion/tone fixtures. This does not approve editorial quality."""
import array
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'out' / 'assembly-smoke'
PUBLIC = OUT / 'public'


def run(*args):
    return subprocess.run(args, cwd=ROOT, check=True, capture_output=True, timeout=300).stdout


def main():
    clips = PUBLIC / 'technical-fixture'
    clips.mkdir(parents=True, exist_ok=True)
    for label, frequency, hue in [('a', 440, 0), ('b', 880, 90)]:
        run('ffmpeg', '-y', '-v', 'error', '-f', 'lavfi', '-i',
            'testsrc2=size=640x360:rate=30:duration=2', '-f', 'lavfi', '-i',
            f'sine=frequency={frequency}:duration=2', '-vf', f'hue=h={hue}',
            '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest',
            str(clips / f'shot-{label}.mp4'))
    config = {
        'layout': 'title-stage',
        'title': {'text': '技術検証', 'subtitle': '品質合格ではありません'},
        'segments': [
            {'id': i, 'clip': {'src': f'technical-fixture/shot-{label}.mp4'},
             'durationInFrames': 60, 'pauseAfter': 0}
            for i, label in enumerate(['a', 'b'], 1)],
        'captions': [
            {'startFrame': 0, 'endFrame': 60, 'text': 'ショットA：440 Hz'},
            {'startFrame': 60, 'endFrame': 120, 'text': 'ショットB：880 Hz'}],
    }
    props = OUT / 'props.json'
    props.write_text(json.dumps({'config': config}, ensure_ascii=False))
    video = OUT / 'technical-fixture.mp4'
    log = run(str(ROOT / 'node_modules/.bin/remotion'), 'render', 'src/index.ts',
              'VideoBackgroundShort', str(video), f'--props={props}',
              f'--public-dir={PUBLIC}', '--scale=0.5', '--concurrency=2')
    (OUT / 'render.log').write_bytes(log)
    probe = json.loads(run('ffprobe', '-v', 'error', '-show_streams', '-of', 'json', str(video)))
    stream = next(s for s in probe['streams'] if s['codec_type'] == 'video')
    assert (stream['width'], stream['height'], int(stream['nb_frames'])) == (540, 960, 120)
    measurements = []
    for start, expected in [(0.5, 440), (2.5, 880)]:
        samples = array.array('f', run('ffmpeg', '-v', 'error', '-ss', str(start),
            '-i', str(video), '-t', '1', '-ac', '1', '-ar', '48000', '-f', 'f32le', '-'))
        crossings = sum(a <= 0 < b for a, b in zip(samples, samples[1:]))
        frequency = crossings * 48000 / len(samples)
        rms = (sum(x*x for x in samples) / len(samples)) ** 0.5
        assert abs(frequency - expected) <= 3, (frequency, expected)
        assert rms > 0.02, rms
        measurements.append({'start': start, 'frequency': frequency, 'rms': rms})
    for second, label in [(1, 'a'), (3, 'b')]:
        run('ffmpeg', '-y', '-v', 'error', '-ss', str(second), '-i', str(video),
            '-frames:v', '1', str(OUT / f'shot-{label}.png'))
    report = {'scope': 'technical assembly only; not editorial quality approval',
              'video': str(video.relative_to(ROOT)), 'video_frames': 120,
              'audio': measurements, 'probe': probe}
    (OUT / 'evidence.json').write_text(json.dumps(report, ensure_ascii=False, indent=2))
    print(json.dumps({'status': 'passed', 'evidence': str(OUT / 'evidence.json')}))


if __name__ == '__main__':
    main()
