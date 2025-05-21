import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const from = location.state?.from?.pathname || '/dashboard';

  // Add effect to check authentication status
  useEffect(() => {
    console.log('🔍 Login Component: Checking authentication status');
    if (isAuthenticated()) {
      console.log('✅ Login Component: User is already authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('🔵 Login Component: Starting login attempt');
      setError('');
      setLoading(true);
      await login(formData.email, formData.password);
      console.log('✅ Login Component: Login successful, navigating to:', from);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('❌ Login Component: Login failed:', err.message);
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
      console.log('ℹ️ Login Component: Login attempt completed');
    }
  };

  // Add effect to log component mount
  useEffect(() => {
    console.log('🔄 Login Component: Component mounted');
    return () => {
      console.log('🔄 Login Component: Component unmounted');
    };
  }, []);

  return (
    <Container className="min-vh-100 d-flex align-items-center justify-content-center py-5">
      <Row className="w-100 justify-content-center">
        <Col xs={12} md={8} lg={6} xl={5}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-primary">Welcome Back</h2>
                <p className="text-muted">Sign in to your account</p>
              </div>

              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email address</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light border-end-0">
                      <i className="bi bi-envelope text-muted"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="border-start-0"
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light border-end-0">
                      <i className="bi bi-lock text-muted"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="border-start-0 border-end-0"
                    />
                    <Button
                      variant="light"
                      className="border-start-0"
                      onClick={togglePasswordVisibility}
                      type="button"
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} text-muted`}></i>
                    </Button>
                  </InputGroup>
                </Form.Group>

                <div className="d-grid mb-4">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    className="py-2"
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </div>

                <div className="text-center">
                  <p className="mb-0">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-primary text-decoration-none">
                      Sign up
                    </Link>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login; 