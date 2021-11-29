
const Counter = ({ days, hours, minutes, seconds, completed }: any) => {
    return (
        <div>
            {hours + (days || 0) * 24} hours, {minutes} minutes, {seconds} seconds
        </div>
    );
};

export default Counter