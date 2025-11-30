"""
Tests for CV endpoints.
"""


class TestCreateCV:
    """Tests for creating CVs."""

    def test_create_cv(self, client, auth_headers):
        """Test creating a CV."""
        response = client.post(
            "/api/v1/cvs/",
            headers=auth_headers,
            json={
                "title": "My Resume",
                "full_name": "John Doe",
                "email": "john@example.com",
                "phone": "+1234567890",
                "location": "San Francisco, CA",
                "summary": "Experienced software engineer",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "My Resume"
        assert data["full_name"] == "John Doe"
        assert data["email"] == "john@example.com"
        assert "id" in data
        assert "user_id" in data
        assert "created_at" in data
        assert "updated_at" in data

    def test_create_cv_minimal(self, client, auth_headers):
        """Test creating a CV with only required fields."""
        response = client.post(
            "/api/v1/cvs/",
            headers=auth_headers,
            json={
                "title": "Minimal Resume",
                "full_name": "Jane Doe",
                "email": "jane@example.com",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Minimal Resume"
        assert data["phone"] is None
        assert data["location"] is None
        assert data["summary"] is None

    def test_create_cv_no_auth(self, client):
        """Test creating CV without authentication fails."""
        response = client.post(
            "/api/v1/cvs/",
            json={
                "title": "Unauthorized Resume",
                "full_name": "John Doe",
                "email": "john@example.com",
            },
        )
        assert response.status_code == 401

    def test_create_cv_invalid_email(self, client, auth_headers):
        """Test creating CV with invalid email format."""
        response = client.post(
            "/api/v1/cvs/",
            headers=auth_headers,
            json={
                "title": "Invalid Email Resume",
                "full_name": "John Doe",
                "email": "invalid-email",
            },
        )
        assert response.status_code == 422

    def test_create_cv_missing_required_fields(self, client, auth_headers):
        """Test creating CV with missing required fields."""
        response = client.post(
            "/api/v1/cvs/",
            headers=auth_headers,
            json={
                "title": "Incomplete Resume",
            },
        )
        assert response.status_code == 422


class TestListCVs:
    """Tests for listing CVs."""

    def test_list_cvs(self, client, auth_headers, test_cv):
        """Test listing CVs for authenticated user."""
        response = client.get("/api/v1/cvs/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert data[0]["id"] == test_cv.id

    def test_list_cvs_empty(self, client, auth_headers):
        """Test listing CVs when user has none."""
        response = client.get("/api/v1/cvs/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0

    def test_list_cvs_no_auth(self, client):
        """Test listing CVs without authentication fails."""
        response = client.get("/api/v1/cvs/")
        assert response.status_code == 401

    def test_list_cvs_pagination(self, client, auth_headers, db, test_user):
        """Test pagination of CV list."""
        # Create multiple CVs
        from app.models.cv import CV

        for i in range(5):
            cv = CV(
                user_id=test_user.id,
                title=f"Resume {i}",
                full_name="Test User",
                email="test@example.com",
            )
            db.add(cv)
        db.commit()

        # Test with limit
        response = client.get("/api/v1/cvs/?limit=3", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3

        # Test with skip
        response = client.get("/api/v1/cvs/?skip=2&limit=3", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3

    def test_list_cvs_only_own_cvs(
        self, client, auth_headers, auth_headers_user2, test_cv, test_cv_user2
    ):
        """Test that users only see their own CVs."""
        # User 1 should only see their CV
        response = client.get("/api/v1/cvs/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["id"] == test_cv.id

        # User 2 should only see their CV
        response = client.get("/api/v1/cvs/", headers=auth_headers_user2)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["id"] == test_cv_user2.id


class TestGetCV:
    """Tests for getting a single CV."""

    def test_get_cv(self, client, auth_headers, test_cv):
        """Test getting a CV by ID."""
        response = client.get(f"/api/v1/cvs/{test_cv.id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_cv.id
        assert data["title"] == test_cv.title
        # Should include relationships
        assert "work_experiences" in data
        assert "educations" in data
        assert "skills" in data
        assert "projects" in data

    def test_get_cv_with_relations(
        self,
        client,
        auth_headers,
        test_cv,
        test_work_experience,
        test_education,
        test_skill,
        test_project,
    ):
        """Test getting CV with all related data."""
        response = client.get(f"/api/v1/cvs/{test_cv.id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["work_experiences"]) == 1
        assert len(data["educations"]) == 1
        assert len(data["skills"]) == 1
        assert len(data["projects"]) == 1

    def test_get_cv_not_found(self, client, auth_headers):
        """Test getting non-existent CV."""
        response = client.get("/api/v1/cvs/99999", headers=auth_headers)
        assert response.status_code == 404

    def test_get_cv_no_auth(self, client, test_cv):
        """Test getting CV without authentication."""
        response = client.get(f"/api/v1/cvs/{test_cv.id}")
        assert response.status_code == 401

    def test_get_cv_unauthorized(self, client, auth_headers_user2, test_cv):
        """Test getting another user's CV fails."""
        response = client.get(f"/api/v1/cvs/{test_cv.id}", headers=auth_headers_user2)
        assert response.status_code == 404  # Returns 404 to not leak info


class TestUpdateCV:
    """Tests for updating CVs."""

    def test_update_cv(self, client, auth_headers, test_cv):
        """Test updating a CV."""
        response = client.put(
            f"/api/v1/cvs/{test_cv.id}",
            headers=auth_headers,
            json={
                "title": "Updated Resume Title",
                "summary": "Updated summary",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Resume Title"
        assert data["summary"] == "Updated summary"
        # Other fields should remain unchanged
        assert data["full_name"] == test_cv.full_name
        assert data["email"] == test_cv.email

    def test_update_cv_partial(self, client, auth_headers, test_cv):
        """Test partial update of CV."""
        response = client.put(
            f"/api/v1/cvs/{test_cv.id}",
            headers=auth_headers,
            json={"phone": "+9999999999"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["phone"] == "+9999999999"
        assert data["title"] == test_cv.title  # Unchanged

    def test_update_cv_not_found(self, client, auth_headers):
        """Test updating non-existent CV."""
        response = client.put(
            "/api/v1/cvs/99999",
            headers=auth_headers,
            json={"title": "Updated"},
        )
        assert response.status_code == 404

    def test_update_cv_no_auth(self, client, test_cv):
        """Test updating CV without authentication."""
        response = client.put(
            f"/api/v1/cvs/{test_cv.id}",
            json={"title": "Unauthorized Update"},
        )
        assert response.status_code == 401

    def test_update_cv_unauthorized(self, client, auth_headers_user2, test_cv):
        """Test updating another user's CV fails."""
        response = client.put(
            f"/api/v1/cvs/{test_cv.id}",
            headers=auth_headers_user2,
            json={"title": "Unauthorized Update"},
        )
        assert response.status_code == 404


class TestDeleteCV:
    """Tests for deleting CVs."""

    def test_delete_cv(self, client, auth_headers, test_cv):
        """Test deleting a CV."""
        response = client.delete(f"/api/v1/cvs/{test_cv.id}", headers=auth_headers)
        assert response.status_code == 204

        # Verify it's deleted
        response = client.get(f"/api/v1/cvs/{test_cv.id}", headers=auth_headers)
        assert response.status_code == 404

    def test_delete_cv_cascade(
        self,
        client,
        auth_headers,
        test_cv,
        test_work_experience,
        test_education,
        test_skill,
        test_project,
        db,
    ):
        """Test that deleting CV cascades to related entities."""
        from app.models.cv import CV
        from app.models.education import Education
        from app.models.project import Project
        from app.models.skill import Skill
        from app.models.work_experience import WorkExperience

        cv_id = test_cv.id

        # Delete CV
        response = client.delete(f"/api/v1/cvs/{cv_id}", headers=auth_headers)
        assert response.status_code == 204

        # Verify all related entities are deleted
        assert db.query(CV).filter(CV.id == cv_id).first() is None
        assert (
            db.query(WorkExperience).filter(WorkExperience.cv_id == cv_id).count() == 0
        )
        assert db.query(Education).filter(Education.cv_id == cv_id).count() == 0
        assert db.query(Skill).filter(Skill.cv_id == cv_id).count() == 0
        assert db.query(Project).filter(Project.cv_id == cv_id).count() == 0

    def test_delete_cv_not_found(self, client, auth_headers):
        """Test deleting non-existent CV."""
        response = client.delete("/api/v1/cvs/99999", headers=auth_headers)
        assert response.status_code == 404

    def test_delete_cv_no_auth(self, client, test_cv):
        """Test deleting CV without authentication."""
        response = client.delete(f"/api/v1/cvs/{test_cv.id}")
        assert response.status_code == 401

    def test_delete_cv_unauthorized(self, client, auth_headers_user2, test_cv):
        """Test deleting another user's CV fails."""
        response = client.delete(
            f"/api/v1/cvs/{test_cv.id}", headers=auth_headers_user2
        )
        assert response.status_code == 404
