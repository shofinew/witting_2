import React from 'react';

export function SkyDecoration() {
    return (
        <div className="sky-decoration" aria-hidden="true">
            <div className="sky-moon">
                <span className="sky-moon-crater sky-moon-crater-one" />
                <span className="sky-moon-crater sky-moon-crater-two" />
                <span className="sky-moon-crater sky-moon-crater-three" />
            </div>
            <div className="sky-cloud sky-cloud-one">
                <span />
                <span />
                <span />
            </div>
            <div className="sky-cloud sky-cloud-two">
                <span />
                <span />
                <span />
            </div>
        </div>
    );
}
