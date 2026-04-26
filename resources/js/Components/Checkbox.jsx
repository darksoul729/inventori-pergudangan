export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-gray-300 text-violet-600 shadow-sm focus:ring-violet-500 ' +
                className
            }
        />
    );
}
