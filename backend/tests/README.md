# Test Suite Documentation

Comprehensive test suite for the CV Maker Backend API with 123 tests covering all endpoints and functionality.

## Test Coverage

### Test Files (8 files, 123 tests)

| File | Tests | Description |
|------|-------|-------------|
| `test_auth.py` | 16 | Authentication endpoints (register, login, token validation) |
| `test_cvs.py` | 23 | CV CRUD operations with authorization |
| `test_work_experiences.py` | 20 | Work experience CRUD operations |
| `test_educations.py` | 20 | Education CRUD operations |
| `test_skills.py` | 20 | Skills CRUD operations |
| `test_projects.py` | 20 | Projects CRUD operations |
| `test_health.py` | 6 | Health check and root endpoints |
| `test_main.py` | 2 | Basic endpoint tests |

### Coverage Areas

✅ **Authentication (16 tests)**
- User registration with validation
- Login with OAuth2 password flow
- JWT token generation and validation
- Inactive user handling
- Invalid credentials handling
- Token expiration

✅ **Authorization (40 tests)**
- Users can only access their own CVs
- Users can only modify their own data
- Proper 403/404 responses for unauthorized access
- Token requirement on all protected endpoints

✅ **CRUD Operations (83 tests)**
- Create operations with validation
- Read operations (single and list)
- Update operations (full and partial)
- Delete operations (including cascade)
- Pagination support
- Foreign key validation

✅ **Data Validation (24 tests)**
- Email format validation
- Required field validation
- GPA range validation (0.00-4.00)
- Date format validation
- Invalid data rejection

✅ **Edge Cases (15 tests)**
- Non-existent resources (404)
- Missing authentication (401)
- Unauthorized access (403)
- Invalid data formats (422)
- Cascade delete behavior

## Test Structure

### Fixtures (`conftest.py`)

**Database Fixtures:**
- `db` - Fresh SQLite in-memory database for each test
- `client` - FastAPI test client with database override

**User Fixtures:**
- `test_user` - Active test user
- `test_user2` - Second user for authorization tests
- `inactive_user` - Inactive user for testing

**Authentication Fixtures:**
- `auth_headers` - JWT headers for test_user
- `auth_headers_user2` - JWT headers for test_user2

**Data Fixtures:**
- `test_cv` - Sample CV for test_user
- `test_cv_user2` - Sample CV for test_user2
- `test_work_experience` - Sample work experience
- `test_education` - Sample education entry
- `test_skill` - Sample skill
- `test_project` - Sample project

### Test Classes

Tests are organized into classes by operation type:

```python
# Example from test_cvs.py
class TestCreateCV:
    """Tests for creating CVs."""

class TestListCVs:
    """Tests for listing CVs."""

class TestGetCV:
    """Tests for getting a single CV."""

class TestUpdateCV:
    """Tests for updating CVs."""

class TestDeleteCV:
    """Tests for deleting CVs."""
```

## Running Tests

### Prerequisites

- Python 3.13+
- Virtual environment recommended

### Setup

```bash
# Create virtual environment
python3.13 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install with dev dependencies (recommended)
pip install -e ".[dev]"

# Or install just production dependencies
pip install -e .
```

**Using UV (faster alternative):**
```bash
# Install dependencies with UV
uv sync --all-extras

# Run tests with UV
uv run pytest -v
```

### Run All Tests

```bash
# Verbose output
pytest -v

# With coverage
pytest --cov=app --cov-report=html

# Quiet mode
pytest -q

# Stop on first failure
pytest -x

# Run specific file
pytest tests/test_auth.py -v
```

### Run Specific Tests

```bash
# Run specific test class
pytest tests/test_cvs.py::TestCreateCV -v

# Run specific test method
pytest tests/test_auth.py::TestLogin::test_login_success -v

# Run tests matching pattern
pytest -k "auth" -v
pytest -k "unauthorized" -v
```

### Test Output Options

```bash
# Show print statements
pytest -s

# Short traceback
pytest --tb=short

# No traceback
pytest --tb=no

# Show slowest tests
pytest --durations=10
```

## Test Configuration

**`pytest.ini`:**
```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short
```

**Environment:**
- Tests use SQLite in-memory database (no PostgreSQL required)
- `.env` file required for application settings
- Tests run in isolation (fresh database per test)

## Test Patterns

### Standard Test Pattern

```python
def test_create_resource(self, client, auth_headers):
    """Test creating a resource."""
    response = client.post(
        "/api/v1/resources/",
        headers=auth_headers,
        json={"field": "value"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["field"] == "value"
    assert "id" in data
```

### Authorization Test Pattern

```python
def test_operation_no_auth(self, client):
    """Test operation without authentication."""
    response = client.post("/api/v1/resources/", json={})
    assert response.status_code == 401

def test_operation_unauthorized(self, client, auth_headers_user2, test_resource):
    """Test operation on another user's resource."""
    response = client.get(
        f"/api/v1/resources/{test_resource.id}",
        headers=auth_headers_user2,
    )
    assert response.status_code in [403, 404]  # 403 for security
```

### Validation Test Pattern

```python
def test_create_invalid_data(self, client, auth_headers):
    """Test creating resource with invalid data."""
    response = client.post(
        "/api/v1/resources/",
        headers=auth_headers,
        json={"invalid": "data"},
    )
    assert response.status_code == 422  # Validation error
```

## Key Test Features

### 1. Isolation
- Each test runs with fresh database
- No test affects another test
- Consistent test environment

### 2. Authentication Testing
- JWT token generation and validation
- OAuth2 password flow compliance
- Token expiration handling
- Inactive user rejection

### 3. Authorization Testing
- Multi-user scenarios (user1 vs user2)
- Resource ownership verification
- Proper HTTP status codes (401, 403, 404)
- Security-conscious responses

### 4. Data Validation
- Pydantic schema validation
- Email format validation
- Date object handling (SQLite compatibility)
- GPA range validation
- Required vs optional fields

### 5. Relationship Testing
- Foreign key validation
- Cascade delete verification
- Nested data retrieval
- Relationship integrity

## Common Test Scenarios

### Testing CRUD for a Resource

```python
# Create
response = client.post("/api/v1/resources/", headers=auth_headers, json=data)
assert response.status_code == 201

# Read (single)
response = client.get(f"/api/v1/resources/{id}", headers=auth_headers)
assert response.status_code == 200

# Read (list)
response = client.get("/api/v1/resources/", headers=auth_headers)
assert response.status_code == 200
assert isinstance(response.json(), list)

# Update
response = client.put(f"/api/v1/resources/{id}", headers=auth_headers, json=update_data)
assert response.status_code == 200

# Delete
response = client.delete(f"/api/v1/resources/{id}", headers=auth_headers)
assert response.status_code == 204
```

### Testing Cascade Delete

```python
# Create parent and children
cv = test_cv
work_exp = test_work_experience
education = test_education

# Delete parent
response = client.delete(f"/api/v1/cvs/{cv.id}", headers=auth_headers)
assert response.status_code == 204

# Verify children are deleted
assert db.query(WorkExperience).filter(WorkExperience.cv_id == cv.id).count() == 0
assert db.query(Education).filter(Education.cv_id == cv.id).count() == 0
```

## Troubleshooting

### Common Issues

**1. Import Errors**
```bash
# Ensure you're in the backend directory
cd /path/to/backend
pytest
```

**2. Database Errors**
```bash
# Tests use SQLite in-memory, no setup required
# If you see database errors, check that .env exists
cp .env.example .env
```

**3. Date Format Errors**
```python
# Use Python date objects, not strings
from datetime import date
start_date = date(2020, 1, 1)  # Good
start_date = "2020-01-01"       # Bad (SQLite will reject)
```

**4. Python Version Errors**
```bash
# Use Python 3.10+ for union type syntax (str | List[str])
python3.13 -m venv venv
```

## Test Metrics

- **Total Tests**: 123
- **Test Files**: 8
- **Test Execution Time**: ~6-7 seconds
- **Coverage**: All 35 API endpoints
- **Success Rate**: 100% (all tests passing)

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.13'
      - name: Install dependencies
        run: |
          pip install -e ".[dev]"
      - name: Run tests
        run: pytest -v --cov=app
```
