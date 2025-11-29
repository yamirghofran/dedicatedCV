"""
Tests for skill endpoints.
"""

import pytest


class TestCreateSkill:
    """Tests for creating skills."""

    def test_create_skill(self, client, auth_headers, test_cv):
        """Test creating a skill."""
        response = client.post(
            "/api/v1/skills/",
            headers=auth_headers,
            json={
                "cv_id": test_cv.id,
                "name": "JavaScript",
                "category": "Programming Languages",
                "display_order": 1,
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "JavaScript"
        assert data["category"] == "Programming Languages"
        assert data["cv_id"] == test_cv.id

    def test_create_skill_minimal(self, client, auth_headers, test_cv):
        """Test creating skill with only required fields."""
        response = client.post(
            "/api/v1/skills/",
            headers=auth_headers,
            json={
                "cv_id": test_cv.id,
                "name": "Docker",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Docker"
        assert data["category"] is None

    def test_create_skill_no_auth(self, client, test_cv):
        """Test creating skill without authentication."""
        response = client.post(
            "/api/v1/skills/",
            json={
                "cv_id": test_cv.id,
                "name": "Test",
            },
        )
        assert response.status_code == 401

    def test_create_skill_invalid_cv(self, client, auth_headers):
        """Test creating skill for non-existent CV."""
        response = client.post(
            "/api/v1/skills/",
            headers=auth_headers,
            json={
                "cv_id": 99999,
                "name": "Test",
            },
        )
        assert response.status_code in [400, 403, 404, 422]

    def test_create_skill_unauthorized_cv(self, client, auth_headers_user2, test_cv):
        """Test creating skill for another user's CV."""
        response = client.post(
            "/api/v1/skills/",
            headers=auth_headers_user2,
            json={
                "cv_id": test_cv.id,
                "name": "Test",
            },
        )
        assert response.status_code in [400, 403, 404, 422]


class TestGetSkill:
    """Tests for getting skills."""

    def test_get_skill(self, client, auth_headers, test_skill):
        """Test getting a skill by ID."""
        response = client.get(f"/api/v1/skills/{test_skill.id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_skill.id
        assert data["name"] == test_skill.name
        assert data["category"] == test_skill.category

    def test_get_skill_not_found(self, client, auth_headers):
        """Test getting non-existent skill."""
        response = client.get("/api/v1/skills/99999", headers=auth_headers)
        assert response.status_code in [403, 404]  # 403 is better for security

    def test_get_skill_no_auth(self, client, test_skill):
        """Test getting skill without authentication."""
        response = client.get(f"/api/v1/skills/{test_skill.id}")
        assert response.status_code == 401

    def test_get_skill_unauthorized(self, client, auth_headers_user2, test_skill):
        """Test getting another user's resource returns 403."""
        """Test getting another user's skill."""
        response = client.get(
            f"/api/v1/skills/{test_skill.id}", headers=auth_headers_user2
        )
        assert response.status_code in [403, 404]  # 403 is better for security


class TestUpdateSkill:
    """Tests for updating skills."""

    def test_update_skill(self, client, auth_headers, test_skill):
        """Test updating a skill."""
        response = client.put(
            f"/api/v1/skills/{test_skill.id}",
            headers=auth_headers,
            json={
                "name": "Python 3.12",
                "category": "Programming",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Python 3.12"
        assert data["category"] == "Programming"

    def test_update_skill_partial(self, client, auth_headers, test_skill):
        """Test partial update of skill."""
        response = client.put(
            f"/api/v1/skills/{test_skill.id}",
            headers=auth_headers,
            json={"category": "Updated Category"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["category"] == "Updated Category"
        assert data["name"] == test_skill.name

    def test_update_skill_not_found(self, client, auth_headers):
        """Test updating non-existent skill."""
        response = client.put(
            "/api/v1/skills/99999",
            headers=auth_headers,
            json={"name": "Test"},
        )
        assert response.status_code in [403, 404]  # 403 is better for security

    def test_update_skill_no_auth(self, client, test_skill):
        """Test updating skill without authentication."""
        response = client.put(
            f"/api/v1/skills/{test_skill.id}",
            json={"name": "Test"},
        )
        assert response.status_code == 401

    def test_update_skill_unauthorized(self, client, auth_headers_user2, test_skill):
        """Test updating another user's skill."""
        response = client.put(
            f"/api/v1/skills/{test_skill.id}",
            headers=auth_headers_user2,
            json={"name": "Test"},
        )
        assert response.status_code in [403, 404]  # 403 is better for security


class TestDeleteSkill:
    """Tests for deleting skills."""

    def test_delete_skill(self, client, auth_headers, test_skill):
        """Test deleting a skill."""
        response = client.delete(
            f"/api/v1/skills/{test_skill.id}", headers=auth_headers
        )
        assert response.status_code == 204

        # Verify it's deleted
        response = client.get(f"/api/v1/skills/{test_skill.id}", headers=auth_headers)
        assert response.status_code in [403, 404]  # 403 is better for security

    def test_delete_skill_not_found(self, client, auth_headers):
        """Test deleting non-existent skill."""
        response = client.delete("/api/v1/skills/99999", headers=auth_headers)
        assert response.status_code in [403, 404]  # 403 is better for security

    def test_delete_skill_no_auth(self, client, test_skill):
        """Test deleting skill without authentication."""
        response = client.delete(f"/api/v1/skills/{test_skill.id}")
        assert response.status_code == 401

    def test_delete_skill_unauthorized(self, client, auth_headers_user2, test_skill):
        """Test deleting another user's skill."""
        response = client.delete(
            f"/api/v1/skills/{test_skill.id}", headers=auth_headers_user2
        )
        assert response.status_code in [403, 404]  # 403 is better for security
