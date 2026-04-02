
import React, { useEffect, useMemo, useState } from 'react';
import { AuthPage } from './pages/AuthPage';
import { Header } from './components/Header';
import { EventModal } from './components/EventModal';
import { HomePage } from './pages/HomePage';
import { UsersPage } from './pages/UsersPage';
import { SearchPage } from './pages/SearchPage';
import { ProfilePage } from './pages/ProfilePage';
import { StagePage } from './pages/StagePage';
import { PAGE_TO_STATUS } from './constants';
import { authAPI, userAPI, eventAPI } from './api';

function App() {
    const [activePage, setActivePage] = useState('users');
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
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [usersError, setUsersError] = useState('');
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [eventsByStatus, setEventsByStatus] = useState({
        stage3: [],
        stage2: [],
        stage1: [],
        published: [],
    });
    const [eventsLoading, setEventsLoading] = useState({
        stage3: false,
        stage2: false,
        stage1: false,
        published: false,
    });
    const [eventsError, setEventsError] = useState({
        stage3: '',
        stage2: '',
        stage1: '',
        published: '',
    });
    const [eventUser, setEventUser] = useState(null);
    const [eventDescription, setEventDescription] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventDuration, setEventDuration] = useState('');
    const [eventError, setEventError] = useState('');
    const [eventSuccess, setEventSuccess] = useState('');
    const [isEventSubmitting, setIsEventSubmitting] = useState(false);
    const [eventActionError, setEventActionError] = useState('');
    const [eventActionSuccess, setEventActionSuccess] = useState('');
    const [activeEventActionId, setActiveEventActionId] = useState('');

    // Local storage effect
    useEffect(() => {
        if (!currentUser) {
            return;
        }
        localStorage.setItem('wittingUser', JSON.stringify(currentUser));
    }, [currentUser]);

    // Clock effect
    useEffect(() => {
        const timer = window.setInterval(() => {
            setNow(new Date());
        }, 1000);
        return () => window.clearInterval(timer);
    }, []);

    // Fetch users
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

    // Fetch events by status
    const fetchEventsByStatus = async (status) => {
        try {
            setEventsError((prev) => ({ ...prev, [status]: '' }));
            setEventsLoading((prev) => ({ ...prev, [status]: true }));
            const data = await eventAPI.getByStatus(status);
            setEventsByStatus((prev) => ({ ...prev, [status]: data.events || [] }));
        } catch (err) {
            setEventsError((prev) => ({ ...prev, [status]: err.message || 'Network error: could not load events.' }));
        } finally {
            setEventsLoading((prev) => ({ ...prev, [status]: false }));
        }
    };

    // Load data when active page changes
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
    }, [activePage, currentUser]);

    // Filter users based on search term
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

    // Handle registration
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

    // Handle login
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
            setActivePage('users');
        } catch (err) {
            setAuthError(err.message || 'Network error: please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Close event modal
    const closeEventModal = () => {
        setEventUser(null);
        setEventDescription('');
        setEventDate('');
        setEventDuration('');
        setEventError('');
        setEventSuccess('');
        setIsEventSubmitting(false);
    };

    // Handle logout
    const handleLogout = () => {
        setCurrentUser(null);
        setIsUserMenuOpen(false);
        setLoginPassword('');
        setAuthSuccess('');
        setEventActionError('');
        setEventActionSuccess('');
        localStorage.removeItem('wittingUser');
        closeEventModal();
    };

    // Open event modal
    const openEventModal = (user) => {
        setEventUser(user);
        setEventDescription('');
        setEventDate('');
        setEventDuration('');
        setEventError('');
        setEventSuccess('');
    };

    // Create event
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
            setActivePage('stage3');
        } catch (err) {
            setEventError(err.message || 'Network error: could not create event.');
        } finally {
            setIsEventSubmitting(false);
        }
    };

    // Advance event
    const handleAdvanceEvent = async (eventId) => {
        try {
            setActiveEventActionId(eventId);
            setEventActionError('');
            setEventActionSuccess('');
            const data = await eventAPI.advance(eventId);
            setEventActionSuccess(data.message || 'Event moved successfully.');
            await Promise.all(['stage3', 'stage2', 'stage1'].map((status) => fetchEventsByStatus(status)));
        } catch (err) {
            setEventActionError(err.message || 'Network error: could not update event status.');
        } finally {
            setActiveEventActionId('');
        }
    };

    // Publish event
    const handlePublishEvent = async (eventId) => {
        try {
            setActiveEventActionId(eventId);
            setEventActionError('');
            setEventActionSuccess('');
            const data = await eventAPI.publish(eventId);
            setEventActionSuccess(data.message || 'Event published successfully.');
            await Promise.all(['stage1', 'published'].map((status) => fetchEventsByStatus(status)));
        } catch (err) {
            setEventActionError(err.message || 'Network error: could not publish event.');
        } finally {
            setActiveEventActionId('');
        }
    };

    // Format date and time
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

    // Clear messages helper
    const clearMessages = () => {
        setEventActionError('');
        setEventActionSuccess('');
    };

    // Show auth page if not logged in
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

    // Main app layout
    return (
        <div className="min-h-screen bg-gradient-to-br from-fuchsia-200 via-sky-100 to-cyan-100 p-6">
            <div className="max-w-5xl mx-auto">
                <Header
                    activePage={activePage}
                    setActivePage={setActivePage}
                    currentUser={currentUser}
                    isUserMenuOpen={isUserMenuOpen}
                    setIsUserMenuOpen={setIsUserMenuOpen}
                    onLogout={handleLogout}
                    formattedDate={formattedDate}
                    formattedTime={formattedTime}
                    onClearMessages={clearMessages}
                />

                {activePage === 'home' && (
                    <HomePage
                        events={eventsByStatus.published}
                        isLoading={eventsLoading.published}
                        error={eventsError.published}
                        actionError={eventActionError}
                        actionSuccess={eventActionSuccess}
                        activeEventActionId={activeEventActionId}
                        onRefresh={() => fetchEventsByStatus('published')}
                        onAdvance={handleAdvanceEvent}
                        onPublish={handlePublishEvent}
                    />
                )}

                {activePage === 'users' && (
                    <UsersPage
                        users={users}
                        isLoading={isLoadingUsers}
                        error={usersError}
                        onRefresh={fetchUsers}
                    />
                )}

                {activePage === 'stage3' && (
                    <StagePage
                        stage="stage3"
                        events={eventsByStatus.stage3}
                        isLoading={eventsLoading.stage3}
                        error={eventsError.stage3}
                        actionError={eventActionError}
                        actionSuccess={eventActionSuccess}
                        activeEventActionId={activeEventActionId}
                        onRefresh={() => fetchEventsByStatus('stage3')}
                        onAdvance={handleAdvanceEvent}
                        onPublish={handlePublishEvent}
                    />
                )}

                {activePage === 'stage2' && (
                    <StagePage
                        stage="stage2"
                        events={eventsByStatus.stage2}
                        isLoading={eventsLoading.stage2}
                        error={eventsError.stage2}
                        actionError={eventActionError}
                        actionSuccess={eventActionSuccess}
                        activeEventActionId={activeEventActionId}
                        onRefresh={() => fetchEventsByStatus('stage2')}
                        onAdvance={handleAdvanceEvent}
                        onPublish={handlePublishEvent}
                    />
                )}

                {activePage === 'stage1' && (
                    <StagePage
                        stage="stage1"
                        events={eventsByStatus.stage1}
                        isLoading={eventsLoading.stage1}
                        error={eventsError.stage1}
                        actionError={eventActionError}
                        actionSuccess={eventActionSuccess}
                        activeEventActionId={activeEventActionId}
                        onRefresh={() => fetchEventsByStatus('stage1')}
                        onAdvance={handleAdvanceEvent}
                        onPublish={handlePublishEvent}
                    />
                )}

                {activePage === 'search' && (
                    <SearchPage
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        filteredUsers={filteredUsers}
                        isLoading={isLoadingUsers}
                        error={usersError}
                        onRefresh={fetchUsers}
                        onAddEvent={openEventModal}
                    />
                )}

                {activePage === 'profile' && (
                    <ProfilePage
                        currentUser={currentUser}
                    />
                )}
            </div>

            {eventUser && (
                <EventModal
                    currentUser={currentUser}
                    eventUser={eventUser}
                    eventDescription={eventDescription}
                    setEventDescription={setEventDescription}
                    eventDate={eventDate}
                    setEventDate={setEventDate}
                    eventDuration={eventDuration}
                    setEventDuration={setEventDuration}
                    eventError={eventError}
                    eventSuccess={eventSuccess}
                    isEventSubmitting={isEventSubmitting}
                    onSubmit={handleCreateEvent}
                    onCancel={closeEventModal}
                />
            )}
        </div>
    );
}

export default App;
