"""add profile picture url to user

Revision ID: 7c1c0c9d8a2b
Revises: 5b2f9c3c0f0b
Create Date: 2025-02-28 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "7c1c0c9d8a2b"
down_revision = "5b2f9c3c0f0b"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("user", sa.Column("profile_picture_url", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("user", "profile_picture_url")
