"""
Tests for project endpoints.
"""



class TestCreateProject:
    """Tests for creating projects."""

    def test_create_project(self, client, auth_headers, test_cv):
        """Test creating a project."""
        response = client.post(
            "/api/v1/projects/",
            headers=auth_headers,
            json={
                "cv_id": test_cv.id,
                "name": "Machine Learning Platform",
                "description": "Built an ML platform for training models",
                "technologies": "Python, TensorFlow, Kubernetes",
                "url": "https://github.com/example/ml-platform",
                "start_date": "2022-01-01",
                "end_date": "2023-06-01",
                "display_order": 1,
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Machine Learning Platform"
        assert data["technologies"] == "Python, TensorFlow, Kubernetes"
        assert data["url"] == "https://github.com/example/ml-platform"
        assert data["cv_id"] == test_cv.id

    def test_create_project_minimal(self, client, auth_headers, test_cv):
        """Test creating project with only required fields."""
        response = client.post(
            "/api/v1/projects/",
            headers=auth_headers,
            json={
                "cv_id": test_cv.id,
                "name": "Simple Project",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Simple Project"
        assert data["description"] is None
        assert data["url"] is None

    def test_create_project_ongoing(self, client, auth_headers, test_cv):
        """Test creating ongoing project (no end_date)."""
        response = client.post(
            "/api/v1/projects/",
            headers=auth_headers,
            json={
                "cv_id": test_cv.id,
                "name": "Ongoing Project",
                "start_date": "2023-01-01",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["end_date"] is None

    def test_create_project_no_auth(self, client, test_cv):
        """Test creating project without authentication."""
        response = client.post(
            "/api/v1/projects/",
            json={
                "cv_id": test_cv.id,
                "name": "Test",
            },
        )
        assert response.status_code == 401

    def test_create_project_invalid_cv(self, client, auth_headers):
        """Test creating project for non-existent CV."""
        response = client.post(
            "/api/v1/projects/",
            headers=auth_headers,
            json={
                "cv_id": 99999,
                "name": "Test",
            },
        )
        assert response.status_code in [400, 403, 404, 422]

    def test_create_project_unauthorized_cv(self, client, auth_headers_user2, test_cv):
        """Test creating project for another user's CV."""
        response = client.post(
            "/api/v1/projects/",
            headers=auth_headers_user2,
            json={
                "cv_id": test_cv.id,
                "name": "Test",
            },
        )
        assert response.status_code in [400, 403, 404, 422]


class TestGetProject:
    """Tests for getting projects."""

    def test_get_project(self, client, auth_headers, test_project):
        """Test getting a project by ID."""
        response = client.get(
            f"/api/v1/projects/{test_project.id}", headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_project.id
        assert data["name"] == test_project.name
        assert data["technologies"] == test_project.technologies

    def test_get_project_not_found(self, client, auth_headers):
        """Test getting non-existent project."""
        response = client.get("/api/v1/projects/99999", headers=auth_headers)
        assert response.status_code in [403, 404]  # 403 is better for security

    def test_get_project_no_auth(self, client, test_project):
        """Test getting project without authentication."""
        response = client.get(f"/api/v1/projects/{test_project.id}")
        assert response.status_code == 401

    def test_get_project_unauthorized(self, client, auth_headers_user2, test_project):
        """Test getting another user's resource returns 403."""
        """Test getting another user's project."""
        response = client.get(
            f"/api/v1/projects/{test_project.id}", headers=auth_headers_user2
        )
        assert response.status_code in [403, 404]  # 403 is better for security


class TestUpdateProject:
    """Tests for updating projects."""

    def test_update_project(self, client, auth_headers, test_project):
        """Test updating a project."""
        response = client.put(
            f"/api/v1/projects/{test_project.id}",
            headers=auth_headers,
            json={
                "name": "Updated Project Name",
                "technologies": "Python, React, PostgreSQL",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Project Name"
        assert data["technologies"] == "Python, React, PostgreSQL"

    def test_update_project_partial(self, client, auth_headers, test_project):
        """Test partial update of project."""
        response = client.put(
            f"/api/v1/projects/{test_project.id}",
            headers=auth_headers,
            json={"url": "https://github.com/updated/url"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["url"] == "https://github.com/updated/url"
        assert data["name"] == test_project.name

    def test_update_project_not_found(self, client, auth_headers):
        """Test updating non-existent project."""
        response = client.put(
            "/api/v1/projects/99999",
            headers=auth_headers,
            json={"name": "Test"},
        )
        assert response.status_code in [403, 404]  # 403 is better for security

    def test_update_project_no_auth(self, client, test_project):
        """Test updating project without authentication."""
        response = client.put(
            f"/api/v1/projects/{test_project.id}",
            json={"name": "Test"},
        )
        assert response.status_code == 401

    def test_update_project_unauthorized(
        self, client, auth_headers_user2, test_project
    ):
        """Test updating another user's project."""
        response = client.put(
            f"/api/v1/projects/{test_project.id}",
            headers=auth_headers_user2,
            json={"name": "Test"},
        )
        assert response.status_code in [403, 404]  # 403 is better for security


class TestDeleteProject:
    """Tests for deleting projects."""

    def test_delete_project(self, client, auth_headers, test_project):
        """Test deleting a project."""
        response = client.delete(
            f"/api/v1/projects/{test_project.id}", headers=auth_headers
        )
        assert response.status_code == 204

        # Verify it's deleted
        response = client.get(
            f"/api/v1/projects/{test_project.id}", headers=auth_headers
        )
        assert response.status_code in [403, 404]  # 403 is better for security

    def test_delete_project_not_found(self, client, auth_headers):
        """Test deleting non-existent project."""
        response = client.delete("/api/v1/projects/99999", headers=auth_headers)
        assert response.status_code in [403, 404]  # 403 is better for security

    def test_delete_project_no_auth(self, client, test_project):
        """Test deleting project without authentication."""
        response = client.delete(f"/api/v1/projects/{test_project.id}")
        assert response.status_code == 401

    def test_delete_project_unauthorized(
        self, client, auth_headers_user2, test_project
    ):
        """Test deleting another user's project."""
        response = client.delete(
            f"/api/v1/projects/{test_project.id}", headers=auth_headers_user2
        )
        assert response.status_code in [403, 404]  # 403 is better for security
