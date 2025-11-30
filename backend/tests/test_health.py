"""
Tests for health check endpoint.
"""



class TestHealthCheck:
    """Tests for health check endpoint."""

    def test_health_check(self, client):
        """Test health check endpoint."""
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "app_name" in data
        assert "version" in data
        assert data["status"] in ["ok", "healthy"]

    def test_health_check_no_auth_required(self, client):
        """Test that health check doesn't require authentication."""
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        # Should work without any headers

    def test_health_check_response_structure(self, client):
        """Test that health check returns expected fields."""
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()

        # Check required fields exist
        assert isinstance(data, dict)
        assert len(data) > 0

        # Common health check fields
        assert "status" in data or "app_name" in data or "version" in data


class TestRootEndpoint:
    """Tests for root endpoint."""

    def test_root_endpoint(self, client):
        """Test root endpoint."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "docs" in data
        assert data["docs"] == "/docs"

    def test_root_endpoint_health_link(self, client):
        """Test that root endpoint includes health check link."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "health" in data
        assert "/health" in data["health"]

    def test_root_endpoint_no_auth_required(self, client):
        """Test that root endpoint doesn't require authentication."""
        response = client.get("/")
        assert response.status_code == 200
