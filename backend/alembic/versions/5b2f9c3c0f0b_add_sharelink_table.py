"""add sharelink table

Revision ID: 5b2f9c3c0f0b
Revises: 25f9841d5e79
Create Date: 2025-02-28 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "5b2f9c3c0f0b"
down_revision = "25f9841d5e79"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "sharelink",
        sa.Column("cv_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("url", sa.Text(), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["cv_id"], ["cv.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_sharelink_cv_id"), "sharelink", ["cv_id"], unique=False)
    op.create_index(
        op.f("ix_sharelink_user_id"), "sharelink", ["user_id"], unique=False
    )
    op.create_index(
        op.f("ix_sharelink_expires_at"), "sharelink", ["expires_at"], unique=False
    )
    op.create_index(op.f("ix_sharelink_id"), "sharelink", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_sharelink_id"), table_name="sharelink")
    op.drop_index(op.f("ix_sharelink_expires_at"), table_name="sharelink")
    op.drop_index(op.f("ix_sharelink_user_id"), table_name="sharelink")
    op.drop_index(op.f("ix_sharelink_cv_id"), table_name="sharelink")
    op.drop_table("sharelink")
