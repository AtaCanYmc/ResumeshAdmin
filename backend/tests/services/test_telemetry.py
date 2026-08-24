from unittest.mock import patch

from app.services.telemetry_service import TelemetryService


def test_telemetry_service_init():
    service = TelemetryService()
    assert service is not None


def test_telemetry_capture_event():
    service = TelemetryService()
    with patch("app.services.telemetry_service.logger") as mock_logger:
        service.capture_event("test_id", "test_event", {"prop": "val"})
        mock_logger.info.assert_called_once()
