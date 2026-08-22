"""add medical certificate to leave request

Revision ID: 918ba70f0696
Revises: 76fdbb002555
Create Date: 2026-08-22 13:43:25.512225

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '918ba70f0696'
down_revision: Union[str, Sequence[str], None] = '76fdbb002555'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('leave_requests', sa.Column('medical_certificate_url', sa.String(length=500), nullable=True))

def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('leave_requests', 'medical_certificate_url')
