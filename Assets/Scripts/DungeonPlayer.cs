using UnityEngine;
public class DungeonPlayer : MonoBehaviour
{
    public float maxHealth=100f, health=100f, moveSpeed=6f, attackCooldown=.55f;
    CharacterController controller; Camera cam; float attackTimer, verticalVelocity;
    public void Initialize()
    {
        gameObject.tag="Player"; controller=GetComponent<CharacterController>();
        var c=new GameObject("PlayerCamera"); c.transform.SetParent(transform);
        c.transform.localPosition=new Vector3(0,3.8f,-7.5f); c.transform.localRotation=Quaternion.Euler(20,0,0);
        cam=c.AddComponent<Camera>(); cam.fieldOfView=72f;
    }
    void Update()
    {
        if(controller==null)return; float x=Input.GetAxisRaw("Horizontal"),z=Input.GetAxisRaw("Vertical");
        Vector3 move=(transform.right*x+transform.forward*z).normalized;
        verticalVelocity=controller.isGrounded?-1f:verticalVelocity-20f*Time.deltaTime;
        controller.Move((move*moveSpeed+Vector3.up*verticalVelocity)*Time.deltaTime);
        Vector3 look=Camera.main?Camera.main.transform.forward:transform.forward; look.y=0;
        if(look.sqrMagnitude>.01f)transform.rotation=Quaternion.LookRotation(look);
        attackTimer-=Time.deltaTime;
        if(Input.GetMouseButtonDown(0)&&attackTimer<=0){attackTimer=attackCooldown;Attack();}
    }
    void Attack()
    {
        foreach(var hit in Physics.OverlapSphere(transform.position+transform.forward*1.5f+Vector3.up*.2f,1.8f))
        {var e=hit.GetComponent<DungeonEnemy>();if(e)e.TakeDamage(25f*DungeonGame.Instance.DamageMultiplier);}
        DungeonHUD.ShowMessage("Sword strike");
    }
    public void TakeDamage(float a){health=Mathf.Max(0,health-a);DungeonHUD.Refresh();if(health<=0)Die();}
    public void RestoreHealth(float a){health=Mathf.Min(maxHealth,health+a);DungeonHUD.Refresh();}
    void Die(){health=maxHealth;transform.position=Vector3.zero;DungeonHUD.ShowMessage("You awaken at the dungeon entrance.");DungeonHUD.Refresh();}
}