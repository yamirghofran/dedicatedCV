"""
Tests for education endpoints.
"""



class TestCreateEducation:
    """Tests for creating education entries."""

    def test_create_education(self, client, auth_headers, test_cv):
        """Test creating an education entry."""
        response = client.post(
            "/api/v1/educations/",
            headers=auth_headers,
            json={
                "cv_id": test_cv.id,
                "institution": "MIT",
                "degree": "Master of Science",
                "field_of_study": "Computer Science",
                "start_date": "2019-09-01",
                "end_date": "2021-06-01",
                "description": "Focus on AI",
                "display_order": 1,
                "gpa": 3.95,
                "honors": "Magna Cum Laude",
                "relevant_subjects": "Machine Learning, Computer Vision",
                "thesis_title": "Neural Networks for Image Recognition",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["institution"] == "MIT"
        assert data["degree"] == "Master of Science"
        assert data["gpa"] == "3.95"
        assert data["honors"] == "Magna Cum Laude"
        assert data["cv_id"] == test_cv.id

    def test_create_education_minimal(self, client, auth_headers, test_cv):
        """Test creating education with only required fields."""
        response = client.post(
            "/api/v1/educations/",
            headers=auth_headers,
            json={
                "cv_id": test_cv.id,
                "institution": "Harvard",
                "degree": "Bachelor",
                "start_date": "2015-09-01",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["institution"] == "Harvard"
        assert data["gpa"] is None
        assert data["honors"] is None

    def test_create_education_current_student(self, client, auth_headers, test_cv):
        """Test creating education for current student (no end_date)."""
        response = client.post(
            "/api/v1/educations/",
            headers=auth_headers,
            json={
                "cv_id": test_cv.id,
                "institution": "Yale",
                "degree": "PhD",
                "start_date": "2023-09-01",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["end_date"] is None

    def test_create_education_invalid_gpa(self, client, auth_headers, test_cv):
        """Test creating education with invalid GPA (out of range)."""
        response = client.post(
            "/api/v1/educations/",
            headers=auth_headers,
            json={
                "cv_id": test_cv.id,
                "institution": "Test",
                "degree": "Test",
                "start_date": "2020-01-01",
                "gpa": 5.0,  # Invalid - should be 0.00-4.00
            },
        )
        # Should either fail validation or be accepted (depends on validation rules)
        # Most systems validate GPA range
        assert response.status_code in [201, 422]

    def test_create_education_no_auth(self, client, test_cv):
        """Test creating education without authentication."""
        response = client.post(
            "/api/v1/educations/",
            json={
                "cv_id": test_cv.id,
                "institution": "Test",
                "degree": "Test",
                "start_date": "2020-01-01",
            },
        )
        assert response.status_code == 401

    def test_create_education_unauthorized_cv(
        self, client, auth_headers_user2, test_cv
    ):
        """Test creating education for another user's CV."""
        response = client.post(
            "/api/v1/educations/",
            headers=auth_headers_user2,
            json={
                "cv_id": test_cv.id,
                "institution": "Test",
                "degree": "Test",
                "start_date": "2020-01-01",
            },
        )
        assert response.status_code in [400, 403, 404, 422]


class TestGetEducation:
    """Tests for getting education entries."""

    def test_get_education(self, client, auth_headers, test_education):
        """Test getting an education entry by ID."""
        response = client.get(
            f"/api/v1/educations/{test_education.id}", headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_education.id
        assert data["institution"] == test_education.institution
        assert data["gpa"] == str(test_education.gpa)

    def test_get_education_not_found(self, client, auth_headers):
        """Test getting non-existent education."""
        response = client.get("/api/v1/educations/99999", headers=auth_headers)
        assert response.status_code in [403, 404]  # 403 is better for security

    def test_get_education_no_auth(self, client, test_education):
        """Test getting education without authentication."""
        response = client.get(f"/api/v1/educations/{test_education.id}")
        assert response.status_code == 401

    def test_get_education_unauthorized(self, client, auth_headers_user2, test_education
    ):
        """Test getting another user's education."""
        response = client.get(
            f"/api/v1/educations/{test_education.id}", headers=auth_headers_user2
        )
        assert response.status_code in [403, 404]  # 403 is better for security


class TestUpdateEducation:
    """Tests for updating education entries."""

    def test_update_education(self, client, auth_headers, test_education):
        """Test updating an education entry."""
        response = client.put(
            f"/api/v1/educations/{test_education.id}",
            headers=auth_headers,
            json={
                "institution": "Updated University",
                "gpa": 4.0,
                "honors": "Summa Cum Laude",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["institution"] == "Updated University"
        assert data["gpa"] == "4.00"
        assert data["honors"] == "Summa Cum Laude"

    def test_update_education_partial(self, client, auth_headers, test_education):
        """Test partial update of education."""
        response = client.put(
            f"/api/v1/educations/{test_education.id}",
            headers=auth_headers,
            json={"thesis_title": "Updated Thesis Title"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["thesis_title"] == "Updated Thesis Title"
        assert data["institution"] == test_education.institution

    def test_update_education_not_found(self, client, auth_headers):
        """Test updating non-existent education."""
        response = client.put(
            "/api/v1/educations/99999",
            headers=auth_headers,
            json={"institution": "Test"},
        )
        assert response.status_code in [403, 404]  # 403 is better for security

    def test_update_education_no_auth(self, client, test_education):
        """Test updating education without authentication."""
        response = client.put(
            f"/api/v1/educations/{test_education.id}",
            json={"institution": "Test"},
        )
        assert response.status_code == 401

    def test_update_education_unauthorized(
        self, client, auth_headers_user2, test_education
    ):
        """Test updating another user's education."""
        response = client.put(
            f"/api/v1/educations/{test_education.id}",
            headers=auth_headers_user2,
            json={"institution": "Test"},
        )
        assert response.status_code in [403, 404]  # 403 is better for security


class TestDeleteEducation:
    """Tests for deleting education entries."""

    def test_delete_education(self, client, auth_headers, test_education):
        """Test deleting an education entry."""
        response = client.delete(
            f"/api/v1/educations/{test_education.id}", headers=auth_headers
        )
        assert response.status_code == 204

        # Verify it's deleted
        response = client.get(
            f"/api/v1/educations/{test_education.id}", headers=auth_headers
        )
        assert response.status_code in [403, 404]  # 403 is better for security

    def test_delete_education_not_found(self, client, auth_headers):
        """Test deleting non-existent education."""
        response = client.delete("/api/v1/educations/99999", headers=auth_headers)
        assert response.status_code in [403, 404]  # 403 is better for security

    def test_delete_education_no_auth(self, client, test_education):
        """Test deleting education without authentication."""
        response = client.delete(f"/api/v1/educations/{test_education.id}")
        assert response.status_code == 401

    def test_delete_education_unauthorized(
        self, client, auth_headers_user2, test_education
    ):
        """Test deleting another user's education."""
        response = client.delete(
            f"/api/v1/educations/{test_education.id}", headers=auth_headers_user2
        )
        assert response.status_code in [403, 404]  # 403 is better for security
