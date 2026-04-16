import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <DashboardLayout>
            <Head title="Profil" />

            <div>
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Profil</h1>
                </div>

                <div className="max-w-7xl space-y-6">
                    <div className="bg-white p-8 shadow rounded-lg">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="bg-white p-8 shadow rounded-lg">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-white p-8 shadow rounded-lg">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
