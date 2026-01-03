-- ============================================================================
-- LEAVE MANAGEMENT SCHEMA
-- ============================================================================

-- Table: leave_types
-- Stores different types of leaves (Annual, Sick, Casual, etc.)
CREATE TABLE IF NOT EXISTS leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  default_days_per_year INTEGER NOT NULL DEFAULT 0,
  is_paid BOOLEAN DEFAULT TRUE,
  requires_document BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: employee_leave_balances
-- Tracks leave balance for each employee and leave type
CREATE TABLE IF NOT EXISTS employee_leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  total_allocated DECIMAL(5, 2) NOT NULL DEFAULT 0,
  used DECIMAL(5, 2) NOT NULL DEFAULT 0,
  pending DECIMAL(5, 2) NOT NULL DEFAULT 0,
  available DECIMAL(5, 2) GENERATED ALWAYS AS (total_allocated - used - pending) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_employee_leave_year UNIQUE(employee_id, leave_type_id, year),
  CONSTRAINT balance_check CHECK (used >= 0 AND pending >= 0)
);

-- Table: leave_requests
-- Stores all leave requests with workflow status
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE RESTRICT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days DECIMAL(5, 2) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
  
  -- Approval workflow
  approver_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  approver_comment TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Supporting documents
  document_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_date_range CHECK (end_date >= start_date),
  CONSTRAINT valid_days CHECK (total_days > 0)
);

-- Indexes for performance
CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX idx_leave_balances_employee ON employee_leave_balances(employee_id);
CREATE INDEX idx_leave_balances_year ON employee_leave_balances(year);

-- ============================================================================
-- SEED DATA: Leave Types
-- ============================================================================

INSERT INTO leave_types (name, description, default_days_per_year, is_paid, requires_document) VALUES
  ('Annual Leave', 'Paid annual vacation leave', 20, TRUE, FALSE),
  ('Sick Leave', 'Medical sick leave', 12, TRUE, TRUE),
  ('Casual Leave', 'Short-term casual leave', 10, TRUE, FALSE),
  ('Maternity Leave', 'Maternity leave for mothers', 180, TRUE, TRUE),
  ('Paternity Leave', 'Paternity leave for fathers', 15, TRUE, FALSE),
  ('Unpaid Leave', 'Leave without pay', 0, FALSE, FALSE),
  ('Compensatory Off', 'Comp-off for extra working hours', 0, TRUE, FALSE)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- FUNCTION: Auto-update updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_leave_types_updated_at
  BEFORE UPDATE ON leave_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_balances_updated_at
  BEFORE UPDATE ON employee_leave_balances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at
  BEFORE UPDATE ON leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTION: Calculate business days between two dates
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_business_days(
  start_date DATE,
  end_date DATE
) RETURNS DECIMAL AS $$
DECLARE
  days DECIMAL := 0;
  current_date DATE := start_date;
BEGIN
  WHILE current_date <= end_date LOOP
    -- Count only Monday to Friday (1-5)
    IF EXTRACT(DOW FROM current_date) BETWEEN 1 AND 5 THEN
      days := days + 1;
    END IF;
    current_date := current_date + 1;
  END LOOP;
  RETURN days;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- FUNCTION: Auto-allocate leave balances for new employees
-- ============================================================================

CREATE OR REPLACE FUNCTION allocate_leave_balances_for_employee(
  p_employee_id UUID,
  p_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW())::INTEGER
) RETURNS VOID AS $$
BEGIN
  INSERT INTO employee_leave_balances (employee_id, leave_type_id, year, total_allocated, used, pending)
  SELECT 
    p_employee_id,
    id,
    p_year,
    default_days_per_year,
    0,
    0
  FROM leave_types
  WHERE default_days_per_year > 0
  ON CONFLICT (employee_id, leave_type_id, year) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE leave_types IS 'Master table for different types of leaves';
COMMENT ON TABLE employee_leave_balances IS 'Tracks leave balance per employee, type, and year';
COMMENT ON TABLE leave_requests IS 'All leave requests with approval workflow';
COMMENT ON COLUMN employee_leave_balances.available IS 'Auto-calculated: total_allocated - used - pending';
COMMENT ON FUNCTION calculate_business_days IS 'Calculate working days excluding weekends';
COMMENT ON FUNCTION allocate_leave_balances_for_employee IS 'Auto-allocate leave balances for new employee';
