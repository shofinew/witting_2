import React, { useEffect, useMemo, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthPage } from './pages/AuthPage';
import { Header } from './components/Header';
import { EventModal } from './components/EventModal';
import { HomePage } from './pages/HomePage';
import { UsersPage } from './pages/UsersPage';
import { SearchPage } from './pages/SearchPage';
import { ProfilePage } from './pages/ProfilePage';
import { StagePage } from './pages/StagePage';
import { FeedbackPage } from './pages/FeedbackPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { PAGE_TO_STATUS } from './constants';
import { authAPI, userAPI, eventAPI } from './api';

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

    useEffect(() => {
        if (!currentUser) {
            return;
        }
        localStorage.setItem('wittingUser', JSON.stringify(currentUser));
    }, [currentUser]);

    useEffect(() => {
        const timer = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    const fetchUsers = async () => {
        try {
            setUsersError('');
            setIsLoadingUsers(true);
            const data = await userAPI.getAll();
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
                    return true;
                }
                return user.name?.toLowerCase().includes(normalizedSearch) || user.email?.toLowerCase().includes(normalizedSearch);
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
            setAuthSuccess(data.message || 'Login successful');
            navigate('/users');
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

    const handleCreateEvent = async () => {
        setEventError('');
        setEventSuccess('');

        if (!currentUser?._id || !eventUser?._id) {
            setEventError('User information is missing. Please log in again.');
            return;
        }

        if (!eventDescription.trim() || !eventDate || !eventDuration) {
            setEventError('Description, date, and time duration are required.');
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
            await Promise.all(['stage1', 'published'].map((status) => fetchEventsByStatus(status)));
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
        const shouldArchive = window.confirm('Are you sure you want to archive this event?');
        if (!shouldArchive) {
            return;
        }

        try {
            setActiveEventActionId(eventId);
            setActiveEventActionType('archive');
            setEventActionError('');
            setEventActionSuccess('');
            const data = await eventAPI.archive(eventId, currentUser?._id);
            setEventActionSuccess(data.message || 'Event archived successfully.');
            await fetchEventsByStatus('published');
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
                        path="/public-event"
                        element={
                            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl">
                                <h2 className="text-xl font-bold text-slate-900">Public Event</h2>
                                <p className="mt-2 text-slate-600">This page is currently empty.</p>
                            </div>
                        }
                    />
                    <Route
                        path="/family"
                        element={
                            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl">
                                <h2 className="text-xl font-bold text-slate-900">Family</h2>
                                <p className="mt-2 text-slate-600">This page is currently empty.</p>
                            </div>
                        }
                    />
                    <Route path="/users" element={<UsersPage users={users} isLoading={isLoadingUsers} error={usersError} onRefresh={fetchUsers} />} />
                    <Route path="/users/:userId" element={<UserProfilePage />} />
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
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                filteredUsers={filteredUsers}
                                isLoading={isLoadingUsers}
                                error={usersError}
                                onRefresh={fetchUsers}
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
        </div>
    );
}

export default App;
