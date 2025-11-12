# pos-ecod-edge-ensemble

ECOD 실시간 감지 + IForest 보완(앙상블) 파이프라인.  
`uv` 기반으로 빠르게 실행/배포할 수 있도록 구성되었습니다.

## 빠른 시작

```bash
uv venv
source .venv/bin/activate
uv sync
# 모의 데이터로 실시간처럼 재생
uv run pos-ecod --mock mock/pos_hw_metrics_normal.csv --interval 0.2
uv run pos-ecod --mock mock/pos_hw_metrics_anomaly.csv --interval 0.2
```

## 주요 아이디어

- **Edge(ECOD)**: 비용 낮고 튜닝 거의 없이 실시간 경량 탐지
- **Gateway(IForest 보완)**: 복합 패턴·잡음에 강한 앙상블 보정
- **Ensemble**: `max` (보수적) / `mean` (균형형) 선택 가능

## CLI

```bash
uv run pos-ecod [옵션]
```

주요 옵션:
- `--mock PATH` : CSV 파일을 실시간 스트림처럼 읽어 재생
- `--interval SECS` : 레코드 간 간격(초). 0이면 즉시 처리
- `--window N` : 실시간 윈도 크기(기본 5)
- `--baseline N` : 기준선 윈도 수(기본 60 ≈ 75분 가이드일 때)
- `--threshold-pct P` : 상위 P 백분위 이상을 이상치로 간주 (기본 98)
- `--sustain K` : K번 연속(10중) 초과 시 경보(기본 6)
- `--ensemble {max,mean}` : ECOD/IForest 점수 앙상블 방식 (기본 max)
- `--config config.yaml` : 파라미터를 YAML로 로드
- `--out alerts.csv` : 경보 결과를 CSV로 저장

## 입력 데이터 포맷

CSV 헤더 예시:
```
ts,cpu,mem,net,io
2025-11-10T12:00:00,0.35,0.42,10.5,1.2
```

수치형 컬럼만 특징으로 사용되고, 첫 컬럼(ts)은 타임스탬프로 사용됩니다.

## 출력

표준출력에 경보 로그가 출력되고, `--out`을 지정하면 `alerts.csv`로 저장됩니다.

## 추천 초기값

- `interval=15s`, `window=5`, `baseline=60`, `threshold_pct=98`, `sustain=6`, `ensemble=max`

## 라이선스

MIT
