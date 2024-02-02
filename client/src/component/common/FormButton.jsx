import { Button } from 'antd';

const FormButton = ({ label, htmlType, onClick, className, block, buttonType, variant, loading }) => (
    <Button 
        type={buttonType}
        htmlType={htmlType}
        onClick={onClick}
        className={className}
        block={block}
        variant={variant}
        loading={loading}
        >
        {label}
    </Button>
);

export default FormButton;