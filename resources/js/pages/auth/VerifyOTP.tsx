import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { Form, Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Mail } from 'lucide-react';

interface VerifyOTPProps {
    email: string;
    status?: string;
    errors?: Record<string, string>;
}

export default function VerifyOTP({ email, status, errors }: VerifyOTPProps) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleInputChange = (index: number, value: string) => {
        if (value.length > 1) return; // Only allow single digits

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const paste = e.clipboardData.getData('text');
        const pasteArray = paste.split('').slice(0, 6);

        const newOtp = [...otp];
        pasteArray.forEach((char, index) => {
            if (index < 6 && /^\d$/.test(char)) {
                newOtp[index] = char;
            }
        });
        setOtp(newOtp);

        // Focus the next empty input or the last input
        const nextIndex = pasteArray.length < 6 ? pasteArray.length : 5;
        inputRefs.current[nextIndex]?.focus();
    };

    return (
        <AuthLayout
            title="Check your email"
            description={`We've sent a 6-digit code to ${email}`}
        >
            <Head title="Verify OTP" />

            <div className="flex flex-col gap-6">
                <Form
                    method="post"
                    action="/login/verify"
                    onSubmit={() => {
                        // Reset OTP on success
                        setOtp(['', '', '', '', '', '']);
                    }}
                    className="flex flex-col gap-6"
                >
                    {({ processing, errors: formErrors }) => (
                        <>
                            {/* Hidden input for OTP data */}
                            <input type="hidden" name="otp" value={otp.join('')} />

                            <div className="grid gap-2">
                                <Label htmlFor="otp">Enter verification code</Label>
                                <div className="flex gap-2 justify-center">
                                    {otp.map((digit, index) => (
                                        <Input
                                            key={index}
                                            ref={(el) => {
                                                inputRefs.current[index] = el;
                                            }}
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleInputChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            onPaste={handlePaste}
                                            className="w-12 h-12 text-center text-lg font-semibold"
                                            disabled={processing}
                                        />
                                    ))}
                                </div>
                                {formErrors.otp && (
                                    <p className="text-sm text-red-600 text-center">{formErrors.otp}</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing || otp.some(digit => !digit)}
                            >
                                {processing && <Spinner />}
                                Verify Code
                            </Button>
                        </>
                    )}
                </Form>

                <Form method="post" action="/login/resend">
                    {({ processing: resendProcessing }) => (
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-4">
                                Didn't receive the code?
                            </p>
                            <Button
                                type="submit"
                                variant="outline"
                                disabled={resendProcessing}
                                className="w-full"
                            >
                                <Mail className="mr-2 h-4 w-4" />
                                Resend Code
                            </Button>
                        </div>
                    )}
                </Form>

                <div className="text-center">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => window.history.back()}
                        className="text-sm"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to email
                    </Button>
                </div>

                {status && (
                    <div className="text-center text-sm font-medium text-green-600">
                        {status}
                    </div>
                )}
            </div>
        </AuthLayout>
    );
}