from app.services.scraper_service import is_safe_url


def test_is_safe_url_valid_public():
    # Valid public URL
    assert is_safe_url("https://example.com/job") is True
    assert is_safe_url("http://example.com") is True


def test_is_safe_url_loopback():
    # Loopback addresses
    assert is_safe_url("http://localhost:8000") is False
    assert is_safe_url("http://127.0.0.1:8000") is False
    assert is_safe_url("http://127.0.0.2") is False


def test_is_safe_url_private():
    # Private IP ranges (RFC 1918)
    assert is_safe_url("http://192.168.1.1") is False
    assert is_safe_url("http://10.0.0.1") is False
    assert is_safe_url("http://172.16.0.1") is False


def test_is_safe_url_invalid_schemes():
    # Unsupported schemes
    assert is_safe_url("ftp://example.com") is False
    assert is_safe_url("file:///etc/passwd") is False
    assert is_safe_url("gopher://example.com") is False
