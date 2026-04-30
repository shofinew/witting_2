import React, { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthPage } from './pages/AuthPage';
import { Header } from './components/Header';
import { EventModal } from './components/EventModal';
import { UserProfileModal } from './components/UserProfileModal';
import { HomePage } from './pages/HomePage';
import { UsersPage } from './pages/UsersPage';
import { SearchPage } from './pages/SearchPage';
import { ProfilePage } from './pages/ProfilePage';
import { StagePage } from './pages/StagePage';
import { PublicPage } from './pages/PublicPage';
import { FamilyPage } from './pages/FamilyPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { TotalEventsPage } from './pages/TotalEventsPage';
import { PAGE_TO_STATUS } from './constants';
import { authAPI, userAPI, eventAPI } from './api';
import { getUserUniqueId } from './utils/user';

const isSameLocalDate = (value, today) => {
    if (!value) {
        return false;
    }

    const eventDate = new Date(value);

    return eventDate.getFullYear() === today.getFullYear()
        && eventDate.getMonth() === today.getMonth()
        && eventDate.getDate() === today.getDate();
};

function App() {
    const location = useLocation();
    const navigate = useNavigate();
    const path = location.pathname.replace(/^\//, '');
    const activePage = path === '' ? 'home' : path;

    const [now, setNow] = useState(() => new Date());
    const [authView, setAuthView] = useState('login');
    const [registerName, setRegisterName] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState('');
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [forgotEmail, setForgotEmail] = useState('');
    const [resetOtp, setResetOtp] = useState('');
    const [resetPassword, setResetPassword] = useState('');
    const [resetPasswordConfirm, setResetPasswordConfirm] = useState('');
    const [otpPreview, setOtpPreview] = useState('');
    const [hasRequestedOtp, setHasRequestedOtp] = useState(false);
    const [otpExpiresAt, setOtpExpiresAt] = useState('');
    const [authError, setAuthError] = useState('');
    const [authSuccess, setAuthSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('wittingUser');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            return null;
        }
    });
    const [users, setUsers] = useState([]);
    const [usersError, setUsersError] = useState('');
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [eventsByStatus, setEventsByStatus] = useState({
        stage3: [],
        stage2: [],
        stage1: [],
        published: [],
        archived: [],
    });
    const [eventsLoading, setEventsLoading] = useState({
        stage3: false,
        stage2: false,
        stage1: false,
        published: false,
        archived: false,
    });
    const [eventsError, setEventsError] = useState({
        stage3: '',
        stage2: '',
        stage1: '',
        published: '',
        archived: '',
    });
    const [eventUser, setEventUser] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);
    const [eventDescription, setEventDescription] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventDuration, setEventDuration] = useState('');
    const [eventError, setEventError] = useState('');
    const [eventSuccess, setEventSuccess] = useState('');
    const [isEventSubmitting, setIsEventSubmitting] = useState(false);
    const [eventActionError, setEventActionError] = useState('');
    const [eventActionSuccess, setEventActionSuccess] = useState('');
    const [activeEventActionId, setActiveEventActionId] = useState('');
    const [activeEventActionType, setActiveEventActionType] = useState('');
    const [selectedProfileUser, setSelectedProfileUser] = useState(null);

    const isPastEventDate = (value) => {
        if (!value) {
            return false;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(`${value}T00:00:00`);
        return selectedDate < today;
    };

    const clearPasswordResetState = () => {
        setForgotEmail('');
        setResetOtp('');
        setResetPassword('');
        setResetPasswordConfirm('');
        setOtpPreview('');
        setHasRequestedOtp(false);
        setOtpExpiresAt('');
    };

    useEffect(() => {
        if (!currentUser) {
            return;
        }
        localStorage.setItem('wittingUser', JSON.stringify(currentUser));
    }, [currentUser]);

    useEffect(() => {
        if (!currentUser?._id) {
            return;
        }

        let isMounted = true;

        const runSessionCheck = async () => {
            try {
                const result = await authAPI.validateSession(currentUser._id, currentUser.sessionVersion || 0);
                if (!isMounted || result.valid) {
                    return;
                }

                setCurrentUser(null);
                setAuthView('login');
                setAuthError(result.reason || 'Your session has expired.');
                setAuthSuccess('');
                localStorage.removeItem('wittingUser');
                navigate('/');
            } catch {
                // Keep the local session when validation cannot be reached.
            }
        };

        runSessionCheck();

        return () => {
            isMounted = false;
        };
    }, [currentUser, navigate]);

    useEffect(() => {
        const timer = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    const fetchUsers = async () => {
        try {
            setUsersError('');
            setIsLoadingUsers(true);
            const data = await userAPI.getAll(currentUser?._id);
            setUsers(data.users || []);
        } catch (err) {
            setUsersError(err.message || 'Network error: could not load users.');
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const fetchEventsByStatus = async (status) => {
        if (!currentUser || !currentUser._id) {
            setEventsByStatus((prev) => ({ ...prev, [status]: [] }));
            return;
        }

        try {
            setEventsError((prev) => ({ ...prev, [status]: '' }));
            setEventsLoading((prev) => ({ ...prev, [status]: true }));
            const data = await eventAPI.getByStatus(status, currentUser._id);
            setEventsByStatus((prev) => ({ ...prev, [status]: data.events || [] }));
        } catch (err) {
            setEventsError((prev) => ({ ...prev, [status]: err.message || 'Network error: could not load events.' }));
        } finally {
            setEventsLoading((prev) => ({ ...prev, [status]: false }));
        }
    };

    const handleUserUpdate = (updatedUser) => {
        setCurrentUser(updatedUser);
        localStorage.setItem('wittingUser', JSON.stringify(updatedUser));
    };

    useEffect(() => {
        if (!currentUser) {
            return;
        }

        if (activePage === 'users' || activePage === 'search') {
            fetchUsers();
        }

        const status = PAGE_TO_STATUS[activePage];
        if (status) {
            fetchEventsByStatus(status);
        }

        if (activePage === 'profile') {
            fetchEventsByStatus('archived');
        }
    }, [activePage, currentUser]);

    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filteredUsers = useMemo(
        () =>
            users.filter((user) => {
                if (!normalizedSearch) {
                    return false;
                }
                return getUserUniqueId(user).toLowerCase().includes(normalizedSearch);
            }),
        [normalizedSearch, users]
    );

    const handleRegister = async (e) => {
        e.preventDefault();
        setAuthError('');
        setAuthSuccess('');

        if (!registerName || !registerEmail || !registerPassword || !registerPasswordConfirm) {
            setAuthError('All fields are required.');
            return;
        }

        if (registerPassword !== registerPasswordConfirm) {
            setAuthError('Passwords do not match.');
            return;
        }

        if (registerPassword.length < 8) {
            setAuthError('Password must be at least 8 characters long.');
            return;
        }

        try {
            setIsSubmitting(true);
            const data = await authAPI.register(registerName, registerEmail, registerPassword, registerPasswordConfirm);
            setAuthSuccess(data.message || 'Registration successful');
            setRegisterName('');
            setRegisterEmail('');
            setRegisterPassword('');
            setRegisterPasswordConfirm('');
            setLoginEmail(registerEmail);
            setAuthView('login');
            clearPasswordResetState();
        } catch (err) {
            setAuthError(err.message || 'Network error: please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setAuthError('');
        setAuthSuccess('');

        if (!loginEmail || !loginPassword) {
            setAuthError('Email and password are required.');
            return;
        }

        try {
            setIsSubmitting(true);
            const data = await authAPI.login(loginEmail, loginPassword);
            setCurrentUser(data.user);
            setLoginPassword('');
            clearPasswordResetState();
            setAuthSuccess(data.message || 'Login successful');
            navigate('/users');
        } catch (err) {
            setAuthError(err.message || 'Network error: please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRequestPasswordReset = async (e) => {
        e.preventDefault();
        setAuthError('');
        setAuthSuccess('');

        if (!forgotEmail) {
            setAuthError('Email is required.');
            return;
        }

        try {
            setIsSubmitting(true);
            const normalizedEmail = forgotEmail.trim().toLowerCase();
            setForgotEmail(normalizedEmail);
            setResetOtp('');
            setResetPassword('');
            setResetPasswordConfirm('');
            setOtpPreview('');
            setHasRequestedOtp(false);
            setOtpExpiresAt('');

            const data = await authAPI.requestPasswordReset(normalizedEmail);
            setOtpPreview(data.otpPreview || '');
            setHasRequestedOtp(true);
            setOtpExpiresAt(data.expiresAt || '');
            setAuthSuccess(data.otpPreview
                ? `OTP generated. It will expire in 20 minutes. Use the code shown below.`
                : 'If the account exists, an OTP has been generated for 20 minutes.');
        } catch (err) {
            setAuthError(err.message || 'Network error: please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setAuthError('');
        setAuthSuccess('');

        if (!forgotEmail || !resetOtp || !resetPassword || !resetPasswordConfirm) {
            setAuthError('Email, OTP, and both password fields are required.');
            return;
        }

        if (!hasRequestedOtp) {
            setAuthError('Request an OTP before trying to reset your password.');
            return;
        }

        if (resetPassword !== resetPasswordConfirm) {
            setAuthError('Passwords do not match.');
            return;
        }

        if (resetPassword.length < 8) {
            setAuthError('Password must be at least 8 characters long.');
            return;
        }

        try {
            setIsSubmitting(true);
            const normalizedEmail = forgotEmail.trim().toLowerCase();
            const data = await authAPI.resetPassword(normalizedEmail, resetOtp.trim(), resetPassword, resetPasswordConfirm);
            setLoginEmail(normalizedEmail);
            setLoginPassword('');
            setAuthView('login');
            setCurrentUser(null);
            localStorage.removeItem('wittingUser');
            clearPasswordResetState();
            setAuthSuccess(data.message || 'Password reset successful.');
            navigate('/');
        } catch (err) {
            setAuthError(err.message || 'Network error: please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeEventModal = () => {
        setEventUser(null);
        setEditingEvent(null);
        setEventDescription('');
        setEventDate('');
        setEventDuration('');
        setEventError('');
        setEventSuccess('');
        setIsEventSubmitting(false);
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setLoginPassword('');
        clearPasswordResetState();
        setAuthSuccess('');
        setEventActionError('');
        setEventActionSuccess('');
        setActiveEventActionId('');
        setActiveEventActionType('');
        localStorage.removeItem('wittingUser');
        closeEventModal();
        navigate('/');
    };

    const openEventModal = (user) => {
        if (!currentUser?._id || currentUser._id === user?._id) {
            return;
        }

        setEditingEvent(null);
        setEventUser(user);
        setEventDescription('');
        setEventDate('');
        setEventDuration('');
        setEventError('');
        setEventSuccess('');
    };

    const openEditEventModal = (event) => {
        setEditingEvent(event);
        setEventUser(event.target);
        setEventDescription(event.description || '');
        setEventDate(event.date ? new Date(event.date).toISOString().split('T')[0] : '');
        setEventDuration(event.timeDuration ? String(event.timeDuration) : '');
        setEventError('');
        setEventSuccess('');
    };

    const openUserProfileModal = (user) => {
        setSelectedProfileUser(user);
    };

    const closeUserProfileModal = () => {
        setSelectedProfileUser(null);
    };

    const handleSelectedProfileUserChange = (updatedUser) => {
        setSelectedProfileUser(updatedUser);
        setUsers((prevUsers) => prevUsers.map((user) => (user._id === updatedUser._id ? updatedUser : user)));
    };

    const handleCreateEvent = async () => {
        setEventError('');
        setEventSuccess('');

        if (!currentUser?._id || !eventUser?._id) {
            setEventError('User information is missing. Please log in again.');
            return;
        }

        if (currentUser._id === eventUser._id) {
            setEventError('You cannot create an event for yourself.');
            return;
        }

        if (!eventDescription.trim() || !eventDate || !eventDuration) {
            setEventError('Description, date, and time duration are required.');
            return;
        }

        if (isPastEventDate(eventDate)) {
            setEventError('Event date must be today or a future date.');
            return;
        }

        try {
            setIsEventSubmitting(true);
            const data = await eventAPI.create(
                currentUser._id,
                eventUser._id,
                eventDescription.trim(),
                eventDate,
                Number(eventDuration)
            );
            setEventSuccess(data.message || 'Event created successfully.');
            await fetchEventsByStatus('stage3');
            closeEventModal();
            setEventActionSuccess(data.message || 'Event created successfully.');
            navigate('/stage3');
        } catch (err) {
            setEventError(err.message || 'Network error: could not create event.');
        } finally {
            setIsEventSubmitting(false);
        }
    };

    const handleEditEvent = async () => {
        setEventError('');
        setEventSuccess('');

        if (!editingEvent?._id) {
            setEventError('Event information is missing. Please try again.');
            return;
        }

        if (!eventDescription.trim() || !eventDate || !eventDuration) {
            setEventError('Description, date, and time duration are required.');
            return;
        }

        if (isPastEventDate(eventDate)) {
            setEventError('Event date must be today or a future date.');
            return;
        }

        try {
            setIsEventSubmitting(true);
            const updateResult = await eventAPI.update(
                editingEvent._id,
                eventDescription.trim(),
                eventDate,
                Number(eventDuration)
            );
            const advanceResult = await eventAPI.advance(editingEvent._id);
            setEventActionSuccess(advanceResult.message || updateResult.message || 'Event updated successfully.');
            closeEventModal();
            await Promise.all(['stage3', 'stage2', 'stage1'].map((status) => fetchEventsByStatus(status)));
        } catch (err) {
            setEventError(err.message || 'Network error: could not update event.');
        } finally {
            setIsEventSubmitting(false);
        }
    };

    const handleAdvanceEvent = async (eventId) => {
        try {
            setActiveEventActionId(eventId);
            setActiveEventActionType('advance');
            setEventActionError('');
            setEventActionSuccess('');
            const data = await eventAPI.advance(eventId);
            setEventActionSuccess(data.message || 'Event moved successfully.');
            await Promise.all(['stage3', 'stage2', 'stage1'].map((status) => fetchEventsByStatus(status)));
        } catch (err) {
            setEventActionError(err.message || 'Network error: could not update event status.');
        } finally {
            setActiveEventActionId('');
            setActiveEventActionType('');
        }
    };

    const handlePublishEvent = async (eventId) => {
        try {
            setActiveEventActionId(eventId);
            setActiveEventActionType('publish');
            setEventActionError('');
            setEventActionSuccess('');
            const data = await eventAPI.publish(eventId, currentUser?._id);
            setEventActionSuccess(data.message || 'Event published successfully.');
            await Promise.all(['stage3', 'stage1', 'published'].map((status) => fetchEventsByStatus(status)));
        } catch (err) {
            setEventActionError(err.message || 'Network error: could not publish event.');
        } finally {
            setActiveEventActionId('');
            setActiveEventActionType('');
        }
    };

    const handleDeleteEvent = async (eventId) => {
        const shouldDelete = window.confirm('Are you sure you want to delete this event?');
        if (!shouldDelete) {
            return;
        }

        try {
            setActiveEventActionId(eventId);
            setActiveEventActionType('delete');
            setEventActionError('');
            setEventActionSuccess('');
            const data = await eventAPI.remove(eventId, currentUser?._id);
            setEventActionSuccess(data.message || 'Event deleted successfully.');
            await Promise.all(['stage3', 'stage2', 'stage1'].map((status) => fetchEventsByStatus(status)));
        } catch (err) {
            setEventActionError(err.message || 'Network error: could not delete event.');
        } finally {
            setActiveEventActionId('');
            setActiveEventActionType('');
        }
    };

    const handleArchiveEvent = async (eventId) => {
        try {
            setActiveEventActionId(eventId);
            setActiveEventActionType('archive');
            setEventActionError('');
            setEventActionSuccess('');
            const data = await eventAPI.archive(eventId, currentUser?._id);
            setEventActionSuccess(data.message || 'Event archived successfully.');
            await Promise.all([
                fetchEventsByStatus('published'),
                fetchEventsByStatus('archived'),
            ]);
        } catch (err) {
            setEventActionError(err.message || 'Network error: could not archive event.');
        } finally {
            setActiveEventActionId('');
            setActiveEventActionType('');
        }
    };

    const handleStartEvent = async (eventId) => {
        try {
            setActiveEventActionId(eventId);
            setActiveEventActionType('start');
            setEventActionError('');
            setEventActionSuccess('');
            const data = await eventAPI.start(eventId, currentUser?._id);
            setEventActionSuccess(data.message || 'Event timer started successfully.');
            await fetchEventsByStatus('published');
        } catch (err) {
            setEventActionError(err.message || 'Network error: could not start event timer.');
        } finally {
            setActiveEventActionId('');
            setActiveEventActionType('');
        }
    };

    const formattedDate = now.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const formattedTime = now.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    const clearMessages = () => {
        setEventActionError('');
        setEventActionSuccess('');
    };

    const todaysPublishedCount = useMemo(
        () => (eventsByStatus.published || []).filter((event) => isSameLocalDate(event.date, now)).length,
        [eventsByStatus.published, now]
    );

    const eventCounts = {
        home: todaysPublishedCount,
        'total-events': eventsByStatus.published?.length || 0,
        stage1: eventsByStatus.stage1?.length || 0,
        stage2: eventsByStatus.stage2?.length || 0,
        stage3: eventsByStatus.stage3?.length || 0,
    };

    if (!currentUser) {
        return (
            <AuthPage
                authView={authView}
                setAuthView={setAuthView}
                authError={authError}
                authSuccess={authSuccess}
                loginEmail={loginEmail}
                setLoginEmail={setLoginEmail}
                loginPassword={loginPassword}
                setLoginPassword={setLoginPassword}
                forgotEmail={forgotEmail}
                setForgotEmail={setForgotEmail}
                resetOtp={resetOtp}
                setResetOtp={setResetOtp}
                resetPassword={resetPassword}
                setResetPassword={setResetPassword}
                resetPasswordConfirm={resetPasswordConfirm}
                setResetPasswordConfirm={setResetPasswordConfirm}
                otpPreview={otpPreview}
                hasRequestedOtp={hasRequestedOtp}
                otpExpiresAt={otpExpiresAt}
                registerName={registerName}
                setRegisterName={setRegisterName}
                registerEmail={registerEmail}
                setRegisterEmail={setRegisterEmail}
                registerPassword={registerPassword}
                setRegisterPassword={setRegisterPassword}
                registerPasswordConfirm={registerPasswordConfirm}
                setRegisterPasswordConfirm={setRegisterPasswordConfirm}
                isSubmitting={isSubmitting}
                onRegister={handleRegister}
                onLogin={handleLogin}
                onRequestPasswordReset={handleRequestPasswordReset}
                onResetPassword={handleResetPassword}
                onClearPasswordResetState={clearPasswordResetState}
                setAuthError={setAuthError}
                setAuthSuccess={setAuthSuccess}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-fuchsia-200 via-sky-100 to-cyan-100 p-6">
            <div className="max-w-5xl mx-auto">
                <Header
                    activePage={activePage}
                    formattedDate={formattedDate}
                    formattedTime={formattedTime}
                    onClearMessages={clearMessages}
                    eventCounts={eventCounts}
                />

                <Routes>
                    <Route path="/" element={<Navigate replace to="/home" />} />
                    <Route
                        path="/home"
                        element={
                            <HomePage
                                events={eventsByStatus.published}
                                now={now}
                                isLoading={eventsLoading.published}
                                error={eventsError.published}
                                actionError={eventActionError}
                                actionSuccess={eventActionSuccess}
                                currentUserId={currentUser._id}
                                activeEventActionId={activeEventActionId}
                                activeEventActionType={activeEventActionType}
                                onRefresh={() => fetchEventsByStatus('published')}
                                onAdvance={handleAdvanceEvent}
                                onPublish={handlePublishEvent}
                                onArchive={handleArchiveEvent}
                                onStart={handleStartEvent}
                            />
                        }
                    />
                    <Route
                        path="/total-events"
                        element={
                            <TotalEventsPage
                                events={eventsByStatus.published}
                                now={now}
                                isLoading={eventsLoading.published}
                                error={eventsError.published}
                                actionError={eventActionError}
                                actionSuccess={eventActionSuccess}
                                currentUserId={currentUser._id}
                                activeEventActionId={activeEventActionId}
                                activeEventActionType={activeEventActionType}
                                onRefresh={() => fetchEventsByStatus('published')}
                                onAdvance={handleAdvanceEvent}
                                onPublish={handlePublishEvent}
                                onArchive={handleArchiveEvent}
                                onStart={handleStartEvent}
                            />
                        }
                    />
                    <Route path="/public" element={<PublicPage currentUser={currentUser} />} />
                    <Route path="/family" element={<FamilyPage />} />
                    <Route
                        path="/users/:userId"
                        element={
                            <UserProfilePage
                                currentUser={currentUser}
                                onCurrentUserUpdate={handleUserUpdate}
                            />
                        }
                    />
                    <Route path="/users" element={<UsersPage users={users} isLoading={isLoadingUsers} error={usersError} onRefresh={fetchUsers} />} />
                    <Route
                        path="/stage3"
                        element={
                            <StagePage
                                stage="stage3"
                                events={eventsByStatus.stage3}
                                now={now}
                                isLoading={eventsLoading.stage3}
                                error={eventsError.stage3}
                                actionError={eventActionError}
                                actionSuccess={eventActionSuccess}
                                currentUserId={currentUser._id}
                                activeEventActionId={activeEventActionId}
                                activeEventActionType={activeEventActionType}
                                onRefresh={() => fetchEventsByStatus('stage3')}
                                onAdvance={handleAdvanceEvent}
                                onPublish={handlePublishEvent}
                                onEdit={openEditEventModal}
                                onDelete={handleDeleteEvent}
                                onArchive={handleArchiveEvent}
                                onStart={handleStartEvent}
                            />
                        }
                    />
                    <Route
                        path="/stage2"
                        element={
                            <StagePage
                                stage="stage2"
                                events={eventsByStatus.stage2}
                                now={now}
                                isLoading={eventsLoading.stage2}
                                error={eventsError.stage2}
                                actionError={eventActionError}
                                actionSuccess={eventActionSuccess}
                                currentUserId={currentUser._id}
                                activeEventActionId={activeEventActionId}
                                activeEventActionType={activeEventActionType}
                                onRefresh={() => fetchEventsByStatus('stage2')}
                                onAdvance={handleAdvanceEvent}
                                onPublish={handlePublishEvent}
                                onEdit={openEditEventModal}
                                onDelete={handleDeleteEvent}
                                onArchive={handleArchiveEvent}
                                onStart={handleStartEvent}
                            />
                        }
                    />
                    <Route
                        path="/stage1"
                        element={
                            <StagePage
                                stage="stage1"
                                events={eventsByStatus.stage1}
                                now={now}
                                isLoading={eventsLoading.stage1}
                                error={eventsError.stage1}
                                actionError={eventActionError}
                                actionSuccess={eventActionSuccess}
                                currentUserId={currentUser._id}
                                activeEventActionId={activeEventActionId}
                                activeEventActionType={activeEventActionType}
                                onRefresh={() => fetchEventsByStatus('stage1')}
                                onAdvance={handleAdvanceEvent}
                                onPublish={handlePublishEvent}
                                onEdit={openEditEventModal}
                                onDelete={handleDeleteEvent}
                                onArchive={handleArchiveEvent}
                                onStart={handleStartEvent}
                            />
                        }
                    />
                    <Route
                        path="/search"
                        element={
                            <SearchPage
                                currentUserId={currentUser._id}
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                filteredUsers={filteredUsers}
                                isLoading={isLoadingUsers}
                                error={usersError}
                                onRefresh={fetchUsers}
                                onViewProfile={openUserProfileModal}
                                onAddEvent={openEventModal}
                            />
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProfilePage
                                currentUser={currentUser}
                                onUserUpdate={handleUserUpdate}
                                onLogout={handleLogout}
                                archivedEvents={eventsByStatus.archived}
                                archiveLoading={eventsLoading.archived}
                                archiveError={eventsError.archived}
                            />
                        }
                    />
                    <Route path="/feedback" element={<FeedbackPage currentUser={currentUser} />} />
                    <Route path="*" element={<Navigate replace to="/home" />} />
                </Routes>
            </div>

            {eventUser && (
                <EventModal
                    currentUser={currentUser}
                    creatorUser={editingEvent?.creator || editingEvent?.creatorId || null}
                    eventUser={eventUser}
                    mode={editingEvent ? 'edit' : 'create'}
                    eventDescription={eventDescription}
                    setEventDescription={setEventDescription}
                    eventDate={eventDate}
                    setEventDate={setEventDate}
                    eventDuration={eventDuration}
                    setEventDuration={setEventDuration}
                    eventError={eventError}
                    eventSuccess={eventSuccess}
                    isEventSubmitting={isEventSubmitting}
                    onSubmit={editingEvent ? handleEditEvent : handleCreateEvent}
                    onCancel={closeEventModal}
                />
            )}

            {selectedProfileUser && (
                <UserProfileModal
                    user={selectedProfileUser}
                    currentUser={currentUser}
                    onUserChange={handleSelectedProfileUserChange}
                    onCurrentUserUpdate={handleUserUpdate}
                    onClose={closeUserProfileModal}
                />
            )}
        </div>
    );
}

export default App;
