import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/NavBar";
import { ArrowLeft, Search, Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AdminPage = () => {
    const navigate = useNavigate();
    const { user, loading } = useUser();

    // Global States
    const [loadingRecalculate, setLoadingRecalculate] = useState(false);
    const [loadingVerifyAll, setLoadingVerifyAll] = useState(false);
    const [verifyAllResult, setVerifyAllResult] = useState<any>(null);

    // Single User States
    const [usernameInput, setUsernameInput] = useState("");
    const [resolvedUser, setResolvedUser] = useState<{ id: string, telegramId: string, displayName: string, profilePhoto?: string, username?: string } | null>(null);
    const [resolvingUser, setResolvingUser] = useState(false);

    // Single User Actions States
    const [loadingVerifySingle, setLoadingVerifySingle] = useState(false);
    const [verifySingleResult, setVerifySingleResult] = useState<any>(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [allUsers, setAllUsers] = useState<any[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!loading && !user?.isAdmin) {
            toast.error("Unauthorised");
            navigate("/dashboard");
        }
    }, [user, loading, navigate]);

    const getToken = () => localStorage.getItem("token");

    // --- Global Actions ---

    const handleRecalculate = async () => {
        if (!confirm("Are you sure? This will wipe and rebuild the balance cache for all users.")) return;
        setLoadingRecalculate(true);
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/transaction/recalculate`,
                {},
                { headers: { Authorization: `Bearer ${getToken()}` } }
            );
            toast.success(res.data.message || "Recalculation successful");
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.error || "Failed to recalculate");
        } finally {
            setLoadingRecalculate(false);
        }
    };

    const handleVerifyAll = async () => {
        setLoadingVerifyAll(true);
        setVerifyAllResult(null);
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/transaction/verify-all`,
                { headers: { Authorization: `Bearer ${getToken()}` } }
            );
            setVerifyAllResult(res.data);
            if (res.data.status === "MATCH") {
                toast.success("All balances match.");
            } else {
                toast.warning("Discrepancies found!");
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.error || "Failed to verify system");
        } finally {
            setLoadingVerifyAll(false);
        }
    };

    // --- Single User Resolution & Actions ---

    const resolveUser = async () => {
        if (!usernameInput) return;
        setResolvingUser(true);
        setResolvedUser(null);
        setVerifySingleResult(null);

        // Remove @ if present
        const cleanUsername = usernameInput.replace("@", "");

        try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/user/username/${cleanUsername}`,
                { headers: { Authorization: `Bearer ${getToken()}` } }
            );
            setResolvedUser(res.data);
        } catch (err: any) {
            console.error(err);
            toast.error("User not found");
        } finally {
            setResolvingUser(false);
        }
    };

    const handleVerifySingle = async () => {
        if (!resolvedUser) return;
        setLoadingVerifySingle(true);
        setVerifySingleResult(null);
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/transaction/verify/${resolvedUser.id}`,
                { headers: { Authorization: `Bearer ${getToken()}` } }
            );
            setVerifySingleResult(res.data);
            if (res.data.status === "MATCH") {
                toast.success("Verification Passed");
            } else {
                toast.warning("Discrepancies found");
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.error || "Failed to verify user");
        } finally {
            setLoadingVerifySingle(false);
        }
    };

    const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !resolvedUser) return;

        if (!resolvedUser.telegramId) {
            toast.error("User does not have a linked Telegram ID");
            return;
        }

        setUploadingPhoto(true);

        // Convert to Base64
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result?.toString().replace(/^data:image\/\w+;base64,/, "");

            try {
                await axios.patch(
                    `${import.meta.env.VITE_API_URL}/user/profilephoto/${resolvedUser.telegramId}`,
                    { profilePhoto: base64String },
                    { headers: { Authorization: `Bearer ${getToken()}` } }
                );
                toast.success("Profile photo updated!");
                if (fileInputRef.current) fileInputRef.current.value = "";
                // Refresh resolved user data
                // For simplicity, we can just re-resolve the user or manually update the state if needed
                // But resolvedUser state might not have the photo url directly if we don't fetch it again
                // For now, just let the user know it worked.
            } catch (err: any) {
                console.error(err);
                toast.error(err.response?.data?.error || "Failed to upload photo");
            } finally {
                setUploadingPhoto(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    if (loading || !user?.isAdmin) return null;

    return (
        <div className="min-h-screen bg-[#F8F8F8] font-outfit flex justify-center px-4">
            <div className="w-full max-w-sm pt-5 pb-24">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Button
                        variant="ghost"
                        className="flex items-center gap-2 px-0 has-[>svg]:pr-0"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="size-5" />
                        <span className="text-base font-medium">Back</span>
                    </Button>
                </div>

                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                </div>

                {/* System Maintenance Card */}
                <Card className="mb-4 shadow-xs">
                    <CardTitle className="px-6 text-lg">System Maintenance</CardTitle>
                    <CardContent className="px-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="font-medium text-sm">Global Verification</p>
                                <p className="text-xs text-muted-foreground">Check all balances</p>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleVerifyAll}
                                disabled={loadingVerifyAll}
                            >
                                {loadingVerifyAll ? <Loader2 className="w-3 h-3 animate-spin" /> : "Run Scan"}
                            </Button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="font-medium text-sm">Recalculate All</p>
                                <p className="text-xs text-muted-foreground">Rebuild balance cache</p>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleRecalculate}
                                disabled={loadingRecalculate}
                            >
                                {loadingRecalculate ? <Loader2 className="w-3 h-3 animate-spin" /> : "Execute"}
                            </Button>
                        </div>

                        {verifyAllResult && (
                            <Alert variant={verifyAllResult.status === "MATCH" ? "default" : "destructive"} className="mt-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>{verifyAllResult.status === "MATCH" ? "System Verified" : "Discrepancies Found"}</AlertTitle>
                                <AlertDescription className="font-mono text-xs mt-2 overflow-auto max-h-40">
                                    <pre>{JSON.stringify(verifyAllResult, null, 2)}</pre>
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* User Management Card */}
                <Card className="mb-4 shadow-xs">
                    <CardTitle className="px-6 text-lg">User Lookup</CardTitle>
                    <CardContent className="px-6 space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Telegram Username"
                                value={usernameInput}
                                onChange={(e) => setUsernameInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && resolveUser()}
                            />
                            <Button size="icon" onClick={resolveUser} disabled={resolvingUser || !usernameInput}>
                                {resolvingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            </Button>
                        </div>

                        {resolvedUser && (
                            <div className="pt-4 border-t animate-in fade-in space-y-4">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={resolvedUser.profilePhoto || resolvedUser.profilePhoto || ""} />
                                        <AvatarFallback>{resolvedUser.displayName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-sm">{resolvedUser.displayName}</p>
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        </div>
                                        <p className="text-xs text-muted-foreground">@{usernameInput.replace('@', '')}</p>
                                        <p className="text-[10px] text-muted-foreground font-mono">ID: {resolvedUser.id}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={handleVerifySingle}
                                        disabled={loadingVerifySingle}
                                    >
                                        {loadingVerifySingle ? <Loader2 className="w-3 h-3 animate-spin" /> : "Check Balance"}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        onClick={triggerFileInput}
                                        disabled={uploadingPhoto}
                                    >
                                        {uploadingPhoto ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Upload className="w-3 h-3 mr-2" /> Upload Photo</>}
                                    </Button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/png, image/jpeg, image/webp"
                                        onChange={handlePhotoUpload}
                                    />
                                </div>

                                {verifySingleResult && (
                                    <Alert variant={verifySingleResult.status === "MATCH" ? "default" : "destructive"}>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>{verifySingleResult.status === "MATCH" ? "Balance Verified" : "Discrepancy Found"}</AlertTitle>
                                        <AlertDescription className="font-mono text-xs mt-2 overflow-auto max-h-40">
                                            <pre>{JSON.stringify(verifySingleResult, null, 2)}</pre>
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* All Users Card */}
                <Card className="mb-4 shadow-xs">
                    <div className="flex items-center justify-between px-6 pt-3">
                        <CardTitle className="text-lg">All Users</CardTitle>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                                try {
                                    const res = await axios.get(
                                        `${import.meta.env.VITE_API_URL}/user/all`,
                                        { headers: { Authorization: `Bearer ${getToken()}` } }
                                    );
                                    setAllUsers(res.data);
                                    toast.success(`Loaded ${res.data.length} users`);
                                } catch (err) {
                                    console.error(err);
                                    toast.error("Failed to load users");
                                }
                            }}
                        >
                            Refresh List
                        </Button>
                    </div>
                    <CardContent className="px-6 space-y-4">

                        {allUsers.length > 0 && (
                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                {allUsers.map((u: any) => (
                                    <div key={u._id} className="flex items-center justify-between p-3 bg-white rounded-lg border shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={u.photoUrl || u.profilePhoto || undefined} />
                                                <AvatarFallback>{(u.displayName || "?").charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-sm truncate">{u.displayName}</p>
                                                    {u.isAdmin && <span className="bg-yellow-100 text-yellow-800 text-[10px] px-1.5 py-0.5 rounded-full font-medium">ADMIN</span>}
                                                    {u.hasSignedUp ? (
                                                        <span className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0.5 rounded-full font-medium">NEST USER</span>
                                                    ) : (
                                                        <span className="bg-gray-100 text-gray-800 text-[10px] px-1.5 py-0.5 rounded-full font-medium">GUEST</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate">@{u.username}</p>
                                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono mt-0.5">
                                                    {u.verifiedAt ? (
                                                        <span title="Last Signed In">Last seen: {new Date(u.verifiedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                    ) : (
                                                        <span>Never signed in</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 ml-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => {
                                                    setUsernameInput(u.username);
                                                }}
                                            >
                                                <Search className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <Navbar />
        </div>
    );
};

export default AdminPage;
