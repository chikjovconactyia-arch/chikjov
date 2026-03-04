-- Grant permissions for the public RPC function
GRANT EXECUTE ON FUNCTION public.create_prospect_lead TO anon, authenticated, service_role;

-- Ensure the function is accessible
COMMENT ON FUNCTION public.create_prospect_lead IS 'Creates a lead from the public landing page';
