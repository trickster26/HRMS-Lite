export default function Header({ title, description, children }) {
    return (
        <header className="page-header">
            <div className="page-header-inner">
                <div>
                    <h1>{title}</h1>
                    {description && <p>{description}</p>}
                </div>
                {children && <div className="flex items-center gap-3">{children}</div>}
            </div>
        </header>
    );
}
