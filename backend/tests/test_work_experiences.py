"""
Tests for work experience endpoints.
"""

import pytest


class TestCreateWorkExperience:
    """Tests for creating work experiences."""

    def test_create_work_experience(self, client, auth_headers, test_cv):
        """Test creating a work experience."""
        response = client.post(
            "/api/v1/work-experiences/",
            headers=auth_headers,
            json={
                "cv_id": test_cv.id,
                "company": "Google",
                "position": "Software Engineer",
                "location": "Mountain View, CA",
                "start_date": "2021-01-01",
                "end_date": "2023-12-31",
                "description": "Developed scalable services",
                "display_order": 1,
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["company"] == "Google"
        assert data["position"] == "Software Engineer"
        assert data["cv_id"] == test_cv.id
        assert "id" in data

    def test_create_work_experience_current_job(self, client, auth_headers, test_cv):
        """Test creating work experience for current job (no end_date)."""
        response = client.post(
            "/api/v1/work-experiences/",
            headers=auth_headers,
            json={
                "cv_id": test_cv.id,
                "company": "Current Corp",
                "position": "Senior Engineer",
                "start_date": "2023-01-01",
                "display_order": 1,
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["end_date"] is None
        assert data["company"] == "Current Corp"

    def test_create_work_experience_no_auth(self, client, test_cv):
        """Test creating work experience without authentication."""
        response = client.post(
            "/api/v1/work-experiences/",
            json={
                "cv_id": test_cv.id,
                "company": "Test",
                "position": "Test",
                "start_date": "2021-01-01",
            },
        )
        assert response.status_code == 401

    def test_create_work_experience_invalid_cv(self, client, auth_headers):
        """Test creating work experience for non-existent CV."""
        response = client.post(
            "/api/v1/work-experiences/",
            headers=auth_headers,
            json={
                "cv_id": 99999,
                "company": "Test",
                "position": "Test",
                "start_date": "2021-01-01",
            },
        )
        assert response.status_code in [400, 403, 404, 422]

    def test_create_work_experience_unauthorized_cv(
        self, client, auth_headers_user2, test_cv
    ):
        """Test creating work experience for another user's CV."""
        response = client.post(
            "/api/v1/work-experiences/",
            headers=auth_headers_user2,
            json={
                "cv_id": test_cv.id,
                "company": "Test",
                "position": "Test",
                "start_date": "2021-01-01",
            },
        )
        assert response.status_code in [400, 403, 404, 422]


class TestGetWorkExperience:
    """Tests for getting work experiences."""

    def test_get_work_experience(self, client, auth_headers, test_work_experience):
        """Test getting a work experience by ID."""
        response = client.get(
            f"/api/v1/work-experiences/{test_work_experience.id}", headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_work_experience.id
        assert data["company"] == test_work_experience.company

    def test_get_work_experience_not_found(self, client, auth_headers):
        """Test getting non-existent work experience."""
        response = client.get("/api/v1/work-experiences/99999", headers=auth_headers)
        assert response.status_code in [403, 404]  # 403 is better for security

    def test_get_work_experience_no_auth(self, client, test_work_experience):
        """Test getting work experience without authentication."""
        response = client.get(f"/api/v1/work-experiences/{test_work_experience.id}")
        assert response.status_code == 401

    def test_get_work_experience_unauthorized(
        self, client, auth_headers_user2, test_work_experience
    ):
        """Test getting another user's work experience."""
        response = client.get(
            f"/api/v1/work-experiences/{test_work_experience.id}",
            headers=auth_headers_user2,
        )
        assert response.status_code in [403, 404]  # 403 is better for security


class TestUpdateWorkExperience:
    """Tests for updating work experiences."""

    def test_update_work_experience(self, client, auth_headers, test_work_experience):
        """Test updating a work experience."""
        response = client.put(
            f"/api/v1/work-experiences/{test_work_experience.id}",
            headers=auth_headers,
            json={
                "company": "Updated Company",
                "position": "Updated Position",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["company"] == "Updated Company"
        assert data["position"] == "Updated Position"

    def test_update_work_experience_partial(
        self, client, auth_headers, test_work_experience
    ):
        """Test partial update of work experience."""
        response = client.put(
            f"/api/v1/work-experiences/{test_work_experience.id}",
            headers=auth_headers,
            json={"description": "Updated description only"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["description"] == "Updated description only"
        assert data["company"] == test_work_experience.company

    def test_update_work_experience_not_found(self, client, auth_headers):
        """Test updating non-existent work experience."""
        response = client.put(
            "/api/v1/work-experiences/99999",
            headers=auth_headers,
            json={"company": "Test"},
        )
        assert response.status_code in [403, 404]  # 403 is better for security

    def test_update_work_experience_no_auth(self, client, test_work_experience):
        """Test updating work experience without authentication."""
        response = client.put(
            f"/api/v1/work-experiences/{test_work_experience.id}",
            json={"company": "Test"},
        )
        assert response.status_code == 401

    def test_update_work_experience_unauthorized(
        self, client, auth_headers_user2, test_work_experience
    ):
        """Test updating another user's work experience."""
        response = client.put(
            f"/api/v1/work-experiences/{test_work_experience.id}",
            headers=auth_headers_user2,
            json={"company": "Test"},
        )
        assert response.status_code in [403, 404]  # 403 is better for security


class TestDeleteWorkExperience:
    """Tests for deleting work experiences."""

    def test_delete_work_experience(self, client, auth_headers, test_work_experience):
        """Test deleting a work experience."""
        response = client.delete(
            f"/api/v1/work-experiences/{test_work_experience.id}", headers=auth_headers
        )
        assert response.status_code == 204

        # Verify it's deleted
        response = client.get(
            f"/api/v1/work-experiences/{test_work_experience.id}", headers=auth_headers
        )
        assert response.status_code in [403, 404]  # 403 is better for security

    def test_delete_work_experience_not_found(self, client, auth_headers):
        """Test deleting non-existent work experience."""
        response = client.delete("/api/v1/work-experiences/99999", headers=auth_headers)
        assert response.status_code in [403, 404]  # 403 is better for security

    def test_delete_work_experience_no_auth(self, client, test_work_experience):
        """Test deleting work experience without authentication."""
        response = client.delete(f"/api/v1/work-experiences/{test_work_experience.id}")
        assert response.status_code == 401

    def test_delete_work_experience_unauthorized(
        self, client, auth_headers_user2, test_work_experience
    ):
        """Test deleting another user's work experience."""
        response = client.delete(
            f"/api/v1/work-experiences/{test_work_experience.id}",
            headers=auth_headers_user2,
        )
        assert response.status_code in [403, 404]  # 403 is better for security
