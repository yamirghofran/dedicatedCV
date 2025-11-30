"""
Tests for authentication endpoints.
"""



class TestRegistration:
    """Tests for user registration."""

    def test_register_user(self, client):
        """Test successful user registration."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "newuser@example.com",
                "password": "securepassword123",
                "full_name": "New User",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "newuser@example.com"
        assert data["full_name"] == "New User"
        assert data["is_active"] is True
        assert data["is_superuser"] is False
        assert "id" in data
        assert "hashed_password" not in data  # Should not expose password

    def test_register_duplicate_email(self, client, test_user):
        """Test registration with duplicate email fails."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "testuser@example.com",
                "password": "password123",
                "full_name": "Duplicate User",
            },
        )
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"].lower()

    def test_register_invalid_email(self, client):
        """Test registration with invalid email format."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "invalid-email",
                "password": "password123",
                "full_name": "Invalid Email User",
            },
        )
        assert response.status_code == 422  # Validation error

    def test_register_missing_fields(self, client):
        """Test registration with missing required fields."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "incomplete@example.com",
            },
        )
        assert response.status_code == 422  # Validation error


class TestLogin:
    """Tests for user login."""

    def test_login_success(self, client, test_user):
        """Test successful login."""
        response = client.post(
            "/api/v1/auth/login",
            data={"username": "testuser@example.com", "password": "testpassword123"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert isinstance(data["access_token"], str)
        assert len(data["access_token"]) > 0

    def test_login_wrong_password(self, client, test_user):
        """Test login with incorrect password."""
        response = client.post(
            "/api/v1/auth/login",
            data={"username": "testuser@example.com", "password": "wrongpassword"},
        )
        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower()

    def test_login_nonexistent_user(self, client):
        """Test login with non-existent email."""
        response = client.post(
            "/api/v1/auth/login",
            data={"username": "nonexistent@example.com", "password": "password123"},
        )
        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower()

    def test_login_inactive_user(self, client, inactive_user):
        """Test login with inactive user account."""
        response = client.post(
            "/api/v1/auth/login",
            data={"username": "inactive@example.com", "password": "testpassword789"},
        )
        assert response.status_code == 400
        assert "inactive" in response.json()["detail"].lower()

    def test_login_missing_credentials(self, client):
        """Test login with missing credentials."""
        response = client.post("/api/v1/auth/login", data={})
        assert response.status_code == 422  # Validation error


class TestAuthenticatedEndpoints:
    """Tests for endpoints that require authentication."""

    def test_get_current_user(self, client, auth_headers, test_user):
        """Test getting current authenticated user."""
        response = client.get("/api/v1/auth/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user.email
        assert data["full_name"] == test_user.full_name
        assert data["id"] == test_user.id

    def test_get_current_user_no_auth(self, client):
        """Test getting current user without authentication fails."""
        response = client.get("/api/v1/auth/me")
        assert response.status_code == 401

    def test_get_current_user_invalid_token(self, client):
        """Test getting current user with invalid token."""
        response = client.get(
            "/api/v1/auth/me", headers={"Authorization": "Bearer invalidtoken"}
        )
        assert response.status_code == 401

    def test_get_current_user_malformed_auth_header(self, client):
        """Test with malformed authorization header."""
        response = client.get(
            "/api/v1/auth/me", headers={"Authorization": "InvalidFormat token"}
        )
        assert response.status_code == 401

    def test_test_token(self, client, auth_headers, test_user):
        """Test token validation endpoint."""
        response = client.post("/api/v1/auth/test-token", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user.email
        assert data["id"] == test_user.id

    def test_test_token_no_auth(self, client):
        """Test token validation without authentication."""
        response = client.post("/api/v1/auth/test-token")
        assert response.status_code == 401

    def test_test_token_expired(self, client):
        """Test with expired token (simulated with invalid token)."""
        # In a real scenario, you'd generate an expired token
        # For now, we test with an invalid token
        response = client.post(
            "/api/v1/auth/test-token",
            headers={"Authorization": "Bearer expiredtoken123"},
        )
        assert response.status_code == 401
