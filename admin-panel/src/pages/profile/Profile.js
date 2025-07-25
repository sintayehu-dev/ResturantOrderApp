import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge, Spinner } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';

const Profile = () => {
  const { user } = useAuth();
  const { userProfile, loading, error, getUserProfile, updateUserProfile, changePassword } = useUser();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    if (user?.user_id) {
      loadUserProfile();
    }
  }, [user?.user_id]);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || ''
      });
    }
  }, [userProfile]);

  const loadUserProfile = async () => {
    try {
      await getUserProfile(user.user_id);
    } catch (err) {
      console.error('Failed to load user profile:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    // Basic validation
    if (!formData.first_name.trim()) {
      setFormError('First name is required');
      return;
    }
    if (!formData.last_name.trim()) {
      setFormError('Last name is required');
      return;
    }
    if (!formData.email.trim()) {
      setFormError('Email is required');
      return;
    }
    if (!formData.phone.trim()) {
      setFormError('Phone is required');
      return;
    }

    try {
      await updateUserProfile(user.user_id, formData);
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setFormError(err.message || 'Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    // Password validation
    if (!passwordData.current_password) {
      setFormError('Current password is required');
      return;
    }
    if (!passwordData.new_password) {
      setFormError('New password is required');
      return;
    }
    if (passwordData.new_password.length < 6) {
      setFormError('New password must be at least 6 characters');
      return;
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      setFormError('New passwords do not match');
      return;
    }

    try {
      await changePassword(user.user_id, {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      setSuccessMessage('Password changed successfully!');
      setIsChangingPassword(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (err) {
      setFormError(err.message || 'Failed to change password');
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  if (loading && !userProfile) {
    return (
      <Container fluid className="p-3 p-md-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-3 p-md-4 fade-in">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h1 className="h3 mb-1" style={{ fontSize: '78.75%', fontWeight: 'bold' }}>User Profile</h1>
          <p className="text-muted mb-0" style={{ fontSize: '78.75%', fontWeight: 'bold' }}>
            Manage your account information and settings
          </p>
        </div>
      </div>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      {formError && <Alert variant="danger" className="mb-4">{formError}</Alert>}
      {successMessage && <Alert variant="success" className="mb-4">{successMessage}</Alert>}

      <Row>
        {/* Profile Information */}
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0" style={{ fontSize: '86.625%', fontWeight: 'bold' }}>Profile Information</h5>
              {!isEditing && (
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  style={{ fontSize: '73.5%', fontWeight: 'bold' }}
                >
                  <i className="bi bi-pencil me-1"></i>
                  Edit Profile
                </Button>
              )}
            </Card.Header>
            <Card.Body>
              {isEditing ? (
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ fontSize: '73.5%', fontWeight: 'bold' }}>First Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          style={{ fontSize: '73.5%', fontWeight: 'bold' }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ fontSize: '73.5%', fontWeight: 'bold' }}>Last Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          style={{ fontSize: '73.5%', fontWeight: 'bold' }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ fontSize: '73.5%', fontWeight: 'bold' }}>Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          style={{ fontSize: '73.5%', fontWeight: 'bold' }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ fontSize: '73.5%', fontWeight: 'bold' }}>Phone</Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          style={{ fontSize: '73.5%', fontWeight: 'bold' }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="d-flex gap-2">
                    <Button 
                      type="submit" 
                      variant="primary"
                      disabled={loading}
                      style={{ fontSize: '73.5%', fontWeight: 'bold' }}
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline-secondary"
                      onClick={() => setIsEditing(false)}
                      style={{ fontSize: '73.5%', fontWeight: 'bold' }}
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              ) : (
                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label text-muted" style={{ fontSize: '73.5%', fontWeight: 'bold' }}>First Name</label>
                      <p className="mb-0" style={{ fontSize: '73.5%', fontWeight: 'bold' }}>{userProfile?.first_name || 'N/A'}</p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label text-muted" style={{ fontSize: '73.5%', fontWeight: 'bold' }}>Last Name</label>
                      <p className="mb-0" style={{ fontSize: '73.5%', fontWeight: 'bold' }}>{userProfile?.last_name || 'N/A'}</p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label text-muted" style={{ fontSize: '73.5%', fontWeight: 'bold' }}>Email</label>
                      <p className="mb-0" style={{ fontSize: '73.5%', fontWeight: 'bold' }}>{userProfile?.email || 'N/A'}</p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <label className="form-label text-muted" style={{ fontSize: '73.5%', fontWeight: 'bold' }}>Phone</label>
                      <p className="mb-0" style={{ fontSize: '73.5%', fontWeight: 'bold' }}>{userProfile?.phone || 'N/A'}</p>
                    </div>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>

          {/* Change Password */}
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0" style={{ fontSize: '86.625%', fontWeight: 'bold' }}>Change Password</h5>
              {!isChangingPassword && (
                <Button 
                  variant="outline-warning" 
                  size="sm"
                  onClick={() => setIsChangingPassword(true)}
                  style={{ fontSize: '73.5%', fontWeight: 'bold' }}
                >
                  <i className="bi bi-key me-1"></i>
                  Change Password
                </Button>
              )}
            </Card.Header>
            <Card.Body>
              {isChangingPassword ? (
                <Form onSubmit={handlePasswordSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontSize: '73.5%', fontWeight: 'bold' }}>Current Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="current_password"
                      value={passwordData.current_password}
                      onChange={handlePasswordChange}
                      style={{ fontSize: '73.5%', fontWeight: 'bold' }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontSize: '73.5%', fontWeight: 'bold' }}>New Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="new_password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      style={{ fontSize: '73.5%', fontWeight: 'bold' }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontSize: '73.5%', fontWeight: 'bold' }}>Confirm New Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirm_password"
                      value={passwordData.confirm_password}
                      onChange={handlePasswordChange}
                      style={{ fontSize: '73.5%', fontWeight: 'bold' }}
                    />
                  </Form.Group>
                  <div className="d-flex gap-2">
                    <Button 
                      type="submit" 
                      variant="warning"
                      disabled={loading}
                      style={{ fontSize: '73.5%', fontWeight: 'bold' }}
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Changing...
                        </>
                      ) : (
                        'Change Password'
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline-secondary"
                      onClick={() => setIsChangingPassword(false)}
                      style={{ fontSize: '73.5%', fontWeight: 'bold' }}
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              ) : (
                <p className="text-muted mb-0" style={{ fontSize: '73.5%', fontWeight: 'bold' }}>
                  Click the button above to change your password
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Account Information */}
        <Col lg={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0" style={{ fontSize: '86.625%', fontWeight: 'bold' }}>Account Information</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <label className="form-label text-muted" style={{ fontSize: '73.5%', fontWeight: 'bold' }}>User ID</label>
                <p className="mb-0" style={{ fontSize: '73.5%', fontWeight: 'bold' }}>{userProfile?.user_id || 'N/A'}</p>
              </div>
              <div className="mb-3">
                <label className="form-label text-muted" style={{ fontSize: '73.5%', fontWeight: 'bold' }}>User Type</label>
                <div>
                  <Badge bg="primary" style={{ fontSize: '73.5%', fontWeight: 'bold' }}>
                    {userProfile?.user_type || 'N/A'}
                  </Badge>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label text-muted" style={{ fontSize: '73.5%', fontWeight: 'bold' }}>Member Since</label>
                <p className="mb-0" style={{ fontSize: '73.5%', fontWeight: 'bold' }}>
                  {userProfile?.created_at ? formatDate(userProfile.created_at) : 'N/A'}
                </p>
              </div>
              <div className="mb-3">
                <label className="form-label text-muted" style={{ fontSize: '73.5%', fontWeight: 'bold' }}>Last Updated</label>
                <p className="mb-0" style={{ fontSize: '73.5%', fontWeight: 'bold' }}>
                  {userProfile?.updated_at ? formatDate(userProfile.updated_at) : 'N/A'}
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile; 