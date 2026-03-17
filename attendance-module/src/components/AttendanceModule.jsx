import { StudentPanel } from './StudentPanel';
import { TeacherPanel } from './TeacherPanel';

export const AttendanceModule = ({ role, ...props }) => {
    if (role === 'teacher') {
        return <TeacherPanel {...props} />;
    }

    if (role === 'student') {
        return <StudentPanel {...props} />;
    }

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-6 bg-destructive/10 rounded-xl border border-destructive/20 text-center shadow-sm">
            <h3 className="text-lg font-bold text-destructive mb-2">Invalid Role Configuration</h3>
            <p className="text-sm text-destructive opacity-80 font-medium">
                The AttendanceModule requires a valid <code>role</code> prop set to either <code>"teacher"</code> or <code>"student"</code>.
            </p>
        </div>
    );
};
