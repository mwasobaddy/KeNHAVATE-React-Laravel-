import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/settings/profile';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
    isCompletion = false,
    user,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    isCompletion?: boolean;
    user?: any;
}) {
    const { auth } = usePage<SharedData>().props;
    const currentUser = user || auth.user;

    // Check if user needs to complete profile
    const needsCompletion = !currentUser.name || !currentUser.username || !currentUser.slug;

    // Use different form for completion vs settings
    const formAction = isCompletion || needsCompletion ? '/profile/update' : ProfileController.update.form();
    const formMethod = isCompletion || needsCompletion ? 'post' : undefined;

    const { data, setData, post, patch, processing, errors, recentlySuccessful } = useForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        username: currentUser.username || '',
        slug: currentUser.slug || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isCompletion || needsCompletion) {
            post('/profile/update');
        } else {
            const routeForm = ProfileController.update.form();
            patch(routeForm.url);
        }
    };

    const title = isCompletion || needsCompletion ? 'Complete Your Profile' : 'Profile information';
    const description = isCompletion || needsCompletion
        ? 'Please fill in your details to continue using the application.'
        : 'Update your name and email address';

    return needsCompletion ? (
        // Standalone completion layout - no AppLayout
        <>
            <Head title={title} />
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                        <p className="mt-2 text-sm text-gray-600">{description}</p>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder="Full name"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div>
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Username"
                            />
                            <InputError message={errors.username} />
                        </div>

                        <div>
                            <Label htmlFor="slug">Slug</Label>
                            <Input
                                id="slug"
                                type="text"
                                value={data.slug}
                                onChange={(e) => setData('slug', e.target.value)}
                                required
                                placeholder="URL slug"
                            />
                            <InputError message={errors.slug} />
                        </div>

                        <Button type="submit" disabled={processing} className="w-full">
                            {processing ? 'Saving...' : 'Save Profile'}
                        </Button>
                    </form>
                </div>
            </div>
        </>
    ) : (
        // Settings layout with AppLayout
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title={title}
                        description={description}
                    />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>

                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                name="name"
                                required
                                autoComplete="name"
                                placeholder="Full name"
                            />

                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                name="email"
                                required
                                autoComplete="username"
                                placeholder="Email address"
                            />

                            <InputError message={errors.email} />
                        </div>

                        {mustVerifyEmail &&
                            currentUser.email_verified_at === null && (
                                <div>
                                    <p className="-mt-4 text-sm text-muted-foreground">
                                        Your email address is
                                        unverified.{' '}
                                        <Link
                                            href={send()}
                                            as="button"
                                            className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                        >
                                            Click here to resend the
                                            verification email.
                                        </Link>
                                    </p>

                                    {status ===
                                        'verification-link-sent' && (
                                        <div className="mt-2 text-sm font-medium text-green-600">
                                            A new verification link has
                                            been sent to your email
                                            address.
                                        </div>
                                    )}
                                </div>
                            )}

                        <div className="flex items-center gap-4">
                            <Button
                                disabled={processing}
                                data-test="update-profile-button"
                            >
                                Save
                            </Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">
                                    Saved
                                </p>
                            </Transition>
                        </div>
                    </form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
